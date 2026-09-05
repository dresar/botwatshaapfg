const { readJSON, writeJSON, isOwner, isAdmin, updateUserData, getUserData, isBlacklisted, isWhitelisted, getUserAutoReply } = require('../../lib/functions');
const config = require('../../config');

async function handleUser(sock, msg, cmd, args, from, sender) {
  switch (cmd) {
    case 'profile':
      try {
        const userData = getUserData(sender);
        if (!userData) {
          await sock.sendMessage(from, { text: 'Data user tidak ditemukan' }, { quoted: msg });
          return true;
        }
        const profile = `*Profile User*\n\nID: ${userData.id}\nNama: ${userData.name}\nTotal Pesan: ${userData.totalMessages}\nTotal Command: ${userData.totalCommands}\nLevel: ${userData.level}\nEXP: ${userData.exp}\nBalance: ${userData.balance}\nFirst Seen: ${new Date(userData.firstSeen).toLocaleString('id-ID')}\nLast Seen: ${new Date(userData.lastSeen).toLocaleString('id-ID')}`;
        await sock.sendMessage(from, { text: profile }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan profile' }, { quoted: msg });
      }
      return true;

    case 'setautoreply':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (args.length < 3) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.setautoreply @6281234567890 on Halo! Bot aktif\n.setautoreply @6281234567890 off\n\n📝 *Contoh:*\n.setautoreply @6281234567890 on Halo! Bot aktif\n.setautoreply @6281234567890 off' }, { quoted: msg });
        return true;
      }
      try {
        const target = args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        const enabled = args[1]?.toLowerCase() === 'on';
        const reply = args.slice(2).join(' ') || 'Auto-reply aktif';
        const userautoreply = readJSON('userautoreply.json');
        if (!userautoreply[target]) userautoreply[target] = {};
        userautoreply[target].enabled = enabled;
        userautoreply[target].reply = reply;
        writeJSON('userautoreply.json', userautoreply);
        await sock.sendMessage(from, { text: `Auto-reply untuk ${target} ${enabled ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal set auto-reply' }, { quoted: msg });
      }
      return true;

    case 'blacklist':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.blacklist @6281234567890\n.blacklist 6281234567890\n\n📝 *Contoh:*\n.blacklist @6281234567890\n.blacklist 6281234567890' }, { quoted: msg });
        return true;
      }
      try {
        const target = args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        const blacklist = readJSON('blacklist.json');
        blacklist[target] = true;
        writeJSON('blacklist.json', blacklist);
        await sock.sendMessage(from, { text: 'User ditambahkan ke blacklist' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal blacklist user' }, { quoted: msg });
      }
      return true;

    case 'unblacklist':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.unblacklist @6281234567890\n.unblacklist 6281234567890\n\n📝 *Contoh:*\n.unblacklist @6281234567890\n.unblacklist 6281234567890' }, { quoted: msg });
        return true;
      }
      try {
        const target = args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        const blacklist = readJSON('blacklist.json');
        delete blacklist[target];
        writeJSON('blacklist.json', blacklist);
        await sock.sendMessage(from, { text: 'User dihapus dari blacklist' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal unblacklist user' }, { quoted: msg });
      }
      return true;

    case 'whitelist':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.whitelist @6281234567890\n.whitelist 6281234567890\n\n📝 *Contoh:*\n.whitelist @6281234567890\n.whitelist 6281234567890' }, { quoted: msg });
        return true;
      }
      try {
        const target = args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        const whitelist = readJSON('whitelist.json');
        whitelist[target] = true;
        writeJSON('whitelist.json', whitelist);
        await sock.sendMessage(from, { text: 'User ditambahkan ke whitelist' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal whitelist user' }, { quoted: msg });
      }
      return true;

    case 'unwhitelist':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.unwhitelist @6281234567890\n.unwhitelist 6281234567890\n\n📝 *Contoh:*\n.unwhitelist @6281234567890\n.unwhitelist 6281234567890' }, { quoted: msg });
        return true;
      }
      try {
        const target = args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        const whitelist = readJSON('whitelist.json');
        delete whitelist[target];
        writeJSON('whitelist.json', whitelist);
        await sock.sendMessage(from, { text: 'User dihapus dari whitelist' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal unwhitelist user' }, { quoted: msg });
      }
      return true;

    case 'note':
      try {
        const noteName = args[0];
        const noteContent = args.slice(1).join(' ');
        if (!noteName || !noteContent) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.note belanja Beli susu dan roti\n.note meeting Meeting jam 3 sore\n\n📝 *Contoh:*\n.note belanja Beli susu dan roti\n.note meeting Meeting jam 3 sore' }, { quoted: msg });
          return true;
        }
        const notes = readJSON('notes.json');
        if (!notes[sender]) notes[sender] = {};
        notes[sender][noteName] = noteContent;
        writeJSON('notes.json', notes);
        await sock.sendMessage(from, { text: 'Note berhasil disimpan' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menyimpan note' }, { quoted: msg });
      }
      return true;

    case 'notes':
      try {
        const notes = readJSON('notes.json');
        const userNotes = notes[sender] || {};
        const noteList = Object.keys(userNotes).map(key => `- ${key}: ${userNotes[key]}`).join('\n');
        await sock.sendMessage(from, { text: `*Notes Anda:*\n${noteList || 'Tidak ada note'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan notes' }, { quoted: msg });
      }
      return true;

    case 'delnote':
      try {
        const noteName = args[0];
        if (!noteName) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.delnote belanja\n.delnote meeting\n\n📝 *Contoh:*\n.delnote belanja\n.delnote meeting' }, { quoted: msg });
          return true;
        }
        const notes = readJSON('notes.json');
        if (notes[sender] && notes[sender][noteName]) {
          delete notes[sender][noteName];
          writeJSON('notes.json', notes);
          await sock.sendMessage(from, { text: 'Note berhasil dihapus' }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Note tidak ditemukan' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menghapus note' }, { quoted: msg });
      }
      return true;

    case 'afk':
      try {
        const reason = args.join(' ') || 'AFK';
        const afk = readJSON('afk.json');
        afk[sender] = {
          reason: reason,
          time: new Date().toISOString()
        };
        writeJSON('afk.json', afk);
        await sock.sendMessage(from, { text: `Anda sekarang AFK: ${reason}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal set AFK' }, { quoted: msg });
      }
      return true;

    case 'unafk':
      try {
        const afk = readJSON('afk.json');
        if (afk[sender]) {
          delete afk[sender];
          writeJSON('afk.json', afk);
          await sock.sendMessage(from, { text: 'Anda tidak lagi AFK' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal unafk' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleUser };

