const fs = require('fs');
const path = require('path');

function readJSON(file) {
  try {
    const data = fs.readFileSync(path.join(__dirname, '..', 'database', file), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(__dirname, '..', 'database', file), JSON.stringify(data, null, 2));
}

function isOwner(userId) {
  const config = require('../config');
  const ownerNumber = config.owner;
  const normalizedOwner = ownerNumber.includes('@') ? ownerNumber : ownerNumber + '@s.whatsapp.net';
  const normalizedUserId = userId.includes('@') ? userId : userId + '@s.whatsapp.net';
  const userIdWithoutSuffix = userId.replace('@s.whatsapp.net', '').replace('@c.us', '');
  const ownerWithoutSuffix = ownerNumber.replace('@s.whatsapp.net', '').replace('@c.us', '');
  return userId === ownerNumber || 
         userId === normalizedOwner || 
         normalizedUserId === normalizedOwner ||
         userIdWithoutSuffix === ownerWithoutSuffix ||
         userId === ownerWithoutSuffix ||
         userIdWithoutSuffix === ownerNumber;
}

function isGroup(msg) {
  return msg.key.remoteJid.endsWith('@g.us');
}

function getGroupId(msg) {
  return msg.key.remoteJid;
}

function getUserId(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

function getMessage(msg) {
  if (msg.message?.conversation) return msg.message.conversation;
  if (msg.message?.extendedTextMessage?.text) return msg.message.extendedTextMessage.text;
  if (msg.message?.imageMessage?.caption) return msg.message.imageMessage.caption;
  if (msg.message?.videoMessage?.caption) return msg.message.videoMessage.caption;
  return '';
}

function getQuotedMessage(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
}

function getQuotedText(msg) {
  const quoted = getQuotedMessage(msg);
  if (quoted?.conversation) return quoted.conversation;
  if (quoted?.extendedTextMessage?.text) return quoted.extendedTextMessage.text;
  return '';
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function getGroupMetadata(sock, jid) {
  return sock.groupMetadata(jid);
}

function getGroupAdmins(sock, jid) {
  return getGroupMetadata(sock, jid).then(meta => {
    return meta.participants.filter(p => p.admin !== null).map(p => p.id);
  });
}

function isGroupAdmin(sock, jid, userId) {
  return getGroupAdmins(sock, jid).then(admins => {
    return admins.includes(userId);
  });
}

function downloadMedia(sock, msg) {
  return sock.downloadMediaMessage(msg);
}

function writeLog(type, data) {
  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'logs'), { recursive: true });
    }
    const logFile = path.join(__dirname, '..', 'logs', 'bot-log.json');
    let logs = [];
    if (fs.existsSync(logFile)) {
      try {
        const logData = fs.readFileSync(logFile, 'utf8');
        logs = JSON.parse(logData);
      } catch (e) {
        logs = [];
      }
    }
    const logEntry = {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('id-ID'),
      type: type,
      ...data
    };
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    return logEntry;
  } catch (e) {
    console.error('Error writing log:', e.message);
    return null;
  }
}

function getLogs(limit = 50) {
  try {
    const logFile = path.join(__dirname, '..', 'logs', 'bot-log.json');
    if (!fs.existsSync(logFile)) {
      return [];
    }
    const logData = fs.readFileSync(logFile, 'utf8');
    const logs = JSON.parse(logData);
    return logs.slice(-limit);
  } catch (e) {
    return [];
  }
}

function updateUserData(userId, data = {}) {
  try {
    const users = readJSON('users.json');
    if (!users[userId]) {
      users[userId] = {
        id: userId,
        name: data.name || 'Unknown',
        totalMessages: 0,
        totalCommands: 0,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isBanned: false,
        isPremium: false,
        exp: 0,
        level: 1,
        balance: 0
      };
    }
    users[userId].lastSeen = new Date().toISOString();
    users[userId].totalMessages = (users[userId].totalMessages || 0) + 1;
    if (data.name) users[userId].name = data.name;
    if (data.exp !== undefined) users[userId].exp = (users[userId].exp || 0) + data.exp;
    if (data.balance !== undefined) users[userId].balance = (users[userId].balance || 0) + data.balance;
    if (data.isCommand) users[userId].totalCommands = (users[userId].totalCommands || 0) + 1;
    writeJSON('users.json', users);
    return users[userId];
  } catch (e) {
    return null;
  }
}

function getUserData(userId) {
  const users = readJSON('users.json');
  return users[userId] || null;
}

function isBlacklisted(userId) {
  const blacklist = readJSON('blacklist.json');
  return blacklist[userId] === true;
}

function isWhitelisted(userId) {
  const whitelist = readJSON('whitelist.json');
  return whitelist[userId] === true;
}

function getUserAutoReply(userId) {
  const userautoreply = readJSON('userautoreply.json');
  return userautoreply[userId] || null;
}

function isAdmin(userId) {
  const config = require('../config');
  if (isOwner(userId)) return true;
  const admins = readJSON('admins.json');
  const normalizedUserId = userId.includes('@') ? userId : userId + '@s.whatsapp.net';
  return admins[normalizedUserId] === true || admins[userId] === true;
}

function addAdmin(userId) {
  const admins = readJSON('admins.json');
  admins[userId] = true;
  writeJSON('admins.json', admins);
}

function removeAdmin(userId) {
  const admins = readJSON('admins.json');
  delete admins[userId];
  writeJSON('admins.json', admins);
}

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'bot_' + key;
}

function addApiKey(name, createdBy) {
  const apikeys = readJSON('apikeys.json');
  const key = generateApiKey();
  apikeys[key] = {
    name: name || 'Unnamed',
    createdBy: createdBy,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0
  };
  writeJSON('apikeys.json', apikeys);
  return key;
}

function deleteApiKey(key) {
  const apikeys = readJSON('apikeys.json');
  if (apikeys[key]) {
    delete apikeys[key];
    writeJSON('apikeys.json', apikeys);
    return true;
  }
  return false;
}

function getAllApiKeys() {
  return readJSON('apikeys.json');
}

function isValidApiKey(key) {
  const config = require('../config');
  if (key === config.apiKey) {
    return true;
  }
  const apikeys = readJSON('apikeys.json');
  if (apikeys[key]) {
    apikeys[key].lastUsed = new Date().toISOString();
    apikeys[key].usageCount = (apikeys[key].usageCount || 0) + 1;
    writeJSON('apikeys.json', apikeys);
    return true;
  }
  return false;
}

module.exports = {
  readJSON,
  writeJSON,
  isOwner,
  isGroup,
  getGroupId,
  getUserId,
  getMessage,
  getQuotedMessage,
  getQuotedText,
  formatTime,
  getGroupMetadata,
  getGroupAdmins,
  isGroupAdmin,
  downloadMedia,
  writeLog,
  getLogs,
  updateUserData,
  getUserData,
  isBlacklisted,
  isWhitelisted,
  getUserAutoReply,
  isAdmin,
  addAdmin,
  removeAdmin,
  generateApiKey,
  addApiKey,
  deleteApiKey,
  getAllApiKeys,
  isValidApiKey
};

