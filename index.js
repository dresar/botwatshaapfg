const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const handler = require('./src/handler');
const { startReminderLoop } = require('./lib/reminder_loop');

const app = express();
const config = require('./config');
const { writeLog } = require('./lib/functions');
const { router: apiRouter, setBotState } = require('./routes/api');

app.use(express.json());
app.use('/api', apiRouter);

console.log('Config loaded:', { owner: config.owner, botName: config.botName });

if (!fs.existsSync('./database')) {
  fs.mkdirSync('./database', { recursive: true });
}

if (!fs.existsSync('./auth_info_baileys')) {
  fs.mkdirSync('./auth_info_baileys', { recursive: true });
}

if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', { recursive: true });
}

writeLog('BOT_START', {
  status: 'starting',
  botName: config.botName,
  owner: config.owner,
  port: config.port,
  prefix: config.prefix
});

app.get('/', (req, res) => {
  res.send('Bot is Running');
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

async function startBot() {
  writeLog('BOT_RESTART', {
    status: 'restarting',
    timestamp: new Date().toISOString()
  });
  
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();
  
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    browser: [config.botName, 'Chrome', '1.0.0'],
    getMessage: async (key) => {
      return {
        conversation: ''
      };
    }
  });

  setBotState({
    sock: sock,
    connectionStatus: 'connecting',
    qrCode: null,
    startTime: Date.now()
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      qrcode.generate(qr, { small: true });
      setBotState({
        qrCode: qr,
        connectionStatus: 'disconnected'
      });
    }
    
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      const disconnectReason = lastDisconnect?.error?.output?.statusCode || 'unknown';
      
      writeLog('BOT_DISCONNECT', {
        status: 'disconnected',
        reason: disconnectReason,
        shouldReconnect: shouldReconnect,
        error: lastDisconnect?.error?.message || null
      });
      
      setBotState({
        connectionStatus: 'disconnected',
        qrCode: null
      });
      
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('Bot Connected!');
      
      setBotState({
        connectionStatus: 'connected',
        qrCode: null,
        startTime: Date.now()
      });
      
      writeLog('BOT_CONNECTED', {
        status: 'connected',
        botName: config.botName,
        owner: config.owner,
        connectionTime: new Date().toISOString()
      });
      
      const ownerNumber = config.owner + '@s.whatsapp.net';
      console.log(`Mencoba mengirim notifikasi ke: ${ownerNumber}`);
      
      const sendNotification = async (retry = 0) => {
        try {
          await sock.sendMessage(ownerNumber, { 
            text: `✅ *Bot Aktif!*\n\nBot ${config.botName} telah berhasil terhubung dan siap digunakan.\n\nWaktu: ${new Date().toLocaleString('id-ID')}` 
          });
          console.log('✅ Notifikasi berhasil dikirim ke owner');
          
          writeLog('NOTIFICATION_SENT', {
            status: 'success',
            recipient: ownerNumber,
            attempts: retry + 1
          });
        } catch (e) {
          console.log(`❌ Gagal mengirim notifikasi (attempt ${retry + 1}):`, e.message);
          
          writeLog('NOTIFICATION_FAILED', {
            status: 'failed',
            recipient: ownerNumber,
            attempts: retry + 1,
            error: e.message
          });
          
          if (retry < 3) {
            setTimeout(() => sendNotification(retry + 1), 2000);
          }
        }
      };
      
      setTimeout(() => {
        sendNotification();
      }, 5000);

      startReminderLoop(sock);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msgs = m.messages;
    for (const msg of msgs) {
      if (msg.key.fromMe) continue;
      if (!msg.message) continue;
      await handler(sock, msg);
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    const { readJSON } = require('./lib/functions');
    const groups = readJSON('groups.json');
    const groupId = update.id;
    
    if (groups[groupId]) {
      if (update.action === 'add' && groups[groupId].welcome) {
        const participants = update.participants;
        for (const participant of participants) {
          await sock.sendMessage(groupId, { text: `Selamat datang @${participant.split('@')[0]}!`, mentions: [participant] });
        }
      }
      if (update.action === 'remove' && groups[groupId].goodbye) {
        const participants = update.participants;
        for (const participant of participants) {
          await sock.sendMessage(groupId, { text: `Selamat tinggal @${participant.split('@')[0]}!`, mentions: [participant] });
        }
      }
    }
  });
}

startBot();

