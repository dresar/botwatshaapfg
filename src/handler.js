const { readJSON, writeJSON, isOwner, isGroup, getGroupId, getUserId, getMessage, getQuotedMessage, getQuotedText, updateUserData, isBlacklisted, isWhitelisted, getUserAutoReply } = require('../lib/functions');
const config = require('../config');
const axios = require('axios');

const handleGroup = require('./handlers/group');
const handleUser = require('./handlers/user');
const handleTools = require('./handlers/tools');
const handleSystem = require('./handlers/system');
const handleMenu = require('./handlers/menu');
const handleProductivity = require('./handlers/productivity');
const handleNetwork = require('./handlers/network');
const handleDev = require('./handlers/dev');
const handleConverter = require('./handlers/converter');

async function handler(sock, msg) {
  const text = getMessage(msg);
  const from = msg.key.remoteJid;
  const sender = getUserId(msg);
  const isGroupMsg = isGroup(msg);
  const groupId = isGroupMsg ? getGroupId(msg) : null;
  const command = text.split(' ')[0]?.toLowerCase();
  const args = text.split(' ').slice(1);
  const quoted = getQuotedMessage(msg);
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

  try {
    const contact = await sock.onWhatsApp(sender);
    const userName = contact?.[0]?.name || 'Unknown';
    updateUserData(sender, { name: userName, isCommand: false });
  } catch (e) {}

  if (isBlacklisted(sender)) {
    return;
  }

  const stats = readJSON('stats.json');
  stats.totalMessages = (stats.totalMessages || 0) + 1;
  writeJSON('stats.json', stats);

  const userAutoReply = getUserAutoReply(sender);
  if (userAutoReply && userAutoReply.enabled && userAutoReply.reply) {
    await sock.sendMessage(from, { text: userAutoReply.reply }, { quoted: msg });
    return;
  }

  const autoreply = readJSON('autoreply.json');
  if (autoreply[text.toLowerCase()]) {
    await sock.sendMessage(from, { text: autoreply[text.toLowerCase()] }, { quoted: msg });
    return;
  }

  if (!command.startsWith(config.prefix)) return;

  const cmd = command.slice(config.prefix.length);
  stats.totalCommands = (stats.totalCommands || 0) + 1;
  writeJSON('stats.json', stats);
  updateUserData(sender, { isCommand: true, exp: 5 });

  let handled = false;

  handled = await handleMenu.handleMenu(sock, msg, cmd, args, from, sender);
  if (handled) return;

  handled = await handleGroup.handleGroup(sock, msg, cmd, args, from, sender, isGroupMsg, groupId, quotedParticipant);
  if (handled) return;

  handled = await handleUser.handleUser(sock, msg, cmd, args, from, sender);
  if (handled) return;

  handled = await handleTools.handleTools(sock, msg, cmd, args, from, quoted);
  if (handled) return;

  handled = await handleSystem.handleSystem(sock, msg, cmd, args, from, sender);
  if (handled) return;

  handled = await handleProductivity.handleProductivity(sock, msg, cmd, args, from, sender);
  if (handled) return;

  handled = await handleNetwork.handleNetwork(sock, msg, cmd, args, from);
  if (handled) return;

  handled = await handleDev.handleDev(sock, msg, cmd, args, from, sender);
  if (handled) return;

  handled = await handleConverter.handleConverter(sock, msg, cmd, args, from, quoted);
  if (handled) return;

  switch (cmd) {
    case 'chat':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.chat Apa itu JavaScript?\n.chat Jelaskan tentang AI\n\n📝 *Contoh:*\n.chat Apa itu JavaScript?\n.chat Jelaskan tentang AI\n.chat Buatkan kode untuk hello world' }, { quoted: msg });
        return;
      }
      try {
        const text = args.join(' ');
        const res = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: text }]
        }, {
          headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
        });
        if (res.data.choices && res.data.choices[0]) {
          await sock.sendMessage(from, { text: res.data.choices[0].message.content }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal chat AI' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal chat AI' }, { quoted: msg });
      }
      break;

    case 'dalle':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.dalle A beautiful sunset over mountains\n.dalle Cat playing with ball\n\n📝 *Contoh:*\n.dalle A beautiful sunset over mountains\n.dalle Cat playing with ball\n.dalle Futuristic city at night' }, { quoted: msg });
        return;
      }
      try {
        const prompt = args.join(' ');
        const res = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        }, {
          headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
        });
        if (res.data.data && res.data.data[0]) {
          await sock.sendMessage(from, { image: { url: res.data.data[0].url } }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal generate gambar' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal generate gambar' }, { quoted: msg });
      }
      break;

    case 'level':
      try {
        const userData = require('../lib/functions').getUserData(sender);
        const exp = userData?.exp || 0;
        const level = Math.floor(exp / 100) + 1;
        await sock.sendMessage(from, { text: `Level: ${level}\nEXP: ${exp}/${level * 100}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan level' }, { quoted: msg });
      }
      break;

    default:
      break;
  }

  if (isGroupMsg) {
    const groups = readJSON('groups.json');
    if (groups[groupId] && groups[groupId].antilink) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (urlRegex.test(text)) {
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
        await sock.sendMessage(from, { text: 'Link terdeteksi! User dikick.' });
      }
    }
  }
}

module.exports = handler;
