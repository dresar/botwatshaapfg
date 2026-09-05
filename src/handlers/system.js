const { readJSON, writeJSON, isOwner, formatTime, isAdmin, addAdmin, removeAdmin, addApiKey, deleteApiKey, getAllApiKeys } = require('../../lib/functions');
const config = require('../../config');

async function handleSystem(sock, msg, cmd, args, from, sender) {
  switch (cmd) {
    case 'runtime':
      try {
        const uptime = process.uptime() * 1000;
        await sock.sendMessage(from, { text: `Runtime: ${formatTime(uptime)}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan runtime' }, { quoted: msg });
      }
      return true;

    case 'ping':
      try {
        const start = Date.now();
        await sock.sendMessage(from, { text: 'Ping...' }, { quoted: msg });
        const end = Date.now();
        await sock.sendMessage(from, { text: `Pong! ${end - start}ms` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal ping' }, { quoted: msg });
      }
      return true;

    case 'speed':
      try {
        const startTime = Date.now();
        await sock.sendMessage(from, { text: 'Testing speed...' }, { quoted: msg });
        const endTime = Date.now();
        await sock.sendMessage(from, { text: `Speed: ${endTime - startTime}ms` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal speed test' }, { quoted: msg });
      }
      return true;

    case 'stats':
      try {
        const stats = readJSON('stats.json');
        const users = readJSON('users.json');
        const groups = readJSON('groups.json');
        const statText = `*Bot Statistics*\n\nTotal Messages: ${stats.totalMessages || 0}\nTotal Commands: ${stats.totalCommands || 0}\nTotal Users: ${Object.keys(users).length}\nTotal Groups: ${Object.keys(groups).length}\nUptime: ${formatTime(process.uptime() * 1000)}`;
        await sock.sendMessage(from, { text: statText }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan stats' }, { quoted: msg });
      }
      return true;

    case 'ownermenu':
      if (!isOwner(sender)) return false;
      const menu = `*Owner Menu*\n\n*Group Commands:*\n.kick [@user]\n.add [number]\n.promote [@user]\n.demote [@user]\n.hidetag [text]\n.tagall [text]\n.groupopen\n.groupclose\n.groupname [name]\n.groupdesc [desc]\n.revokelink\n.getlink\n.antilink\n.welcome\n.goodbye\n.warn [@user]\n.unwarn [@user]\n.mute [@user] [menit]\n.unmute [@user]\n\n*User Commands:*\n.blacklist [@user]\n.unblacklist [@user]\n.whitelist [@user]\n.unwhitelist [@user]\n.setautoreply [@user] [on/off] [reply]\n\n*System:*\n.addautoreply [key] [value]\n.delautoreply [key]\n.listautoreply`;
      await sock.sendMessage(from, { text: menu }, { quoted: msg });
      return true;

    case 'addautoreply':
      if (!isOwner(sender)) return false;
      if (args.length < 2) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.addautoreply halo Halo! Ada yang bisa dibantu?\n\n📝 *Contoh:*\n.addautoreply halo Halo! Ada yang bisa dibantu?\n.addautoreply test Bot berfungsi dengan baik!' }, { quoted: msg });
        return true;
      }
      try {
        const autoreply = readJSON('autoreply.json');
        const key = args[0].toLowerCase();
        const value = args.slice(1).join(' ');
        autoreply[key] = value;
        writeJSON('autoreply.json', autoreply);
        await sock.sendMessage(from, { text: `Auto-reply "${key}" berhasil ditambahkan` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menambah auto-reply' }, { quoted: msg });
      }
      return true;

    case 'delautoreply':
      if (!isOwner(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.delautoreply halo\n\n📝 *Contoh:*\n.delautoreply halo\n.delautoreply test' }, { quoted: msg });
        return true;
      }
      try {
        const autoreply = readJSON('autoreply.json');
        const key = args[0].toLowerCase();
        if (autoreply[key]) {
          delete autoreply[key];
          writeJSON('autoreply.json', autoreply);
          await sock.sendMessage(from, { text: `Auto-reply "${key}" berhasil dihapus` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Auto-reply tidak ditemukan' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menghapus auto-reply' }, { quoted: msg });
      }
      return true;

    case 'listautoreply':
      if (!isOwner(sender)) return false;
      try {
        const autoreply = readJSON('autoreply.json');
        const list = Object.keys(autoreply).map(key => `- ${key}: ${autoreply[key]}`).join('\n');
        await sock.sendMessage(from, { text: `*Auto-Reply List:*\n${list || 'Tidak ada auto-reply'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan list auto-reply' }, { quoted: msg });
      }
      return true;

    case 'addadmin':
      if (!isOwner(sender)) return false;
      try {
        let target = args[0];
        if (!target) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.addadmin @6281234567890\n.addadmin 6281234567890\n\n📝 *Contoh:*\n.addadmin @6281234567890\n.addadmin 6281234567890' }, { quoted: msg });
          return true;
        }
        target = target.replace('@', '').replace('+', '');
        if (!target.includes('@')) {
          target = target + '@s.whatsapp.net';
        }
        addAdmin(target);
        await sock.sendMessage(from, { text: `Admin berhasil ditambahkan: ${target}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menambah admin: ' + e.message }, { quoted: msg });
      }
      return true;

    case 'deladmin':
      if (!isOwner(sender)) return false;
      try {
        const target = args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        if (!args[0]) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.deladmin @6281234567890\n.deladmin 6281234567890\n\n📝 *Contoh:*\n.deladmin @6281234567890\n.deladmin 6281234567890' }, { quoted: msg });
          return true;
        }
        if (isOwner(target)) {
          await sock.sendMessage(from, { text: 'Tidak bisa menghapus owner' }, { quoted: msg });
          return true;
        }
        removeAdmin(target);
        await sock.sendMessage(from, { text: 'Admin berhasil dihapus' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menghapus admin' }, { quoted: msg });
      }
      return true;

    case 'listadmin':
      if (!isOwner(sender)) return false;
      try {
        const admins = readJSON('admins.json');
        const adminList = Object.keys(admins).map(id => `- ${id}`).join('\n');
        await sock.sendMessage(from, { text: `*Admin List:*\nOwner: ${config.owner}\nAdmins:\n${adminList || 'Tidak ada admin'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan list admin' }, { quoted: msg });
      }
      return true;

    case 'genapikey':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        const name = args.join(' ') || 'Unnamed';
        const key = addApiKey(name, sender);
        await sock.sendMessage(from, { text: `✅ *API Key Berhasil Dibuat!*\n\n*Nama:* ${name}\n*Key:* \`${key}\`\n\n⚠️ *PENTING:* Simpan key ini dengan aman! Key tidak akan ditampilkan lagi.` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal generate API key: ' + e.message }, { quoted: msg });
      }
      return true;

    case 'listapikey':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        const apikeys = getAllApiKeys();
        const config = require('../../config');
        let list = `*📋 API Keys List*\n\n*Master Key:* \`${config.apiKey}\`\n\n`;
        
        if (Object.keys(apikeys).length === 0) {
          list += 'Tidak ada API key yang dibuat';
        } else {
          list += '*Generated Keys:*\n';
          for (const [key, data] of Object.entries(apikeys)) {
            const createdDate = new Date(data.createdAt).toLocaleString('id-ID');
            const lastUsed = data.lastUsed ? new Date(data.lastUsed).toLocaleString('id-ID') : 'Belum digunakan';
            list += `\n*${data.name}*\nKey: \`${key}\`\nDibuat: ${createdDate}\nTerakhir digunakan: ${lastUsed}\nUsage: ${data.usageCount}x\n`;
          }
        }
        
        await sock.sendMessage(from, { text: list }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan list API key: ' + e.message }, { quoted: msg });
      }
      return true;

    case 'delapikey':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.delapikey bot_xxxxxxxxxxxxx\n\n📝 *Contoh:*\n.delapikey bot_abc123def456' }, { quoted: msg });
        return true;
      }
      try {
        const key = args[0];
        const config = require('../../config');
        if (key === config.apiKey) {
          await sock.sendMessage(from, { text: 'Tidak bisa menghapus Master API Key' }, { quoted: msg });
          return true;
        }
        if (deleteApiKey(key)) {
          await sock.sendMessage(from, { text: `✅ API Key berhasil dihapus` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'API Key tidak ditemukan' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menghapus API key: ' + e.message }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleSystem };

