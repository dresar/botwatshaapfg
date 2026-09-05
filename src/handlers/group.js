const { readJSON, writeJSON, isOwner, isAdmin, isGroup, getGroupId, getUserId, getMessage, formatTime, getGroupMetadata, getGroupAdmins } = require('../../lib/functions');
const config = require('../../config');

async function handleGroup(sock, msg, cmd, args, from, sender, isGroupMsg, groupId, quotedParticipant) {
  if (!isGroupMsg) return false;

  switch (cmd) {
    case 'kick':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0] && !quotedParticipant) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.kick @6281234567890\nReply pesan user lalu ketik .kick\n\n📝 *Contoh:*\n.kick @6281234567890\n(Reply pesan user) .kick' }, { quoted: msg });
        return true;
      }
      try {
        const target = quotedParticipant || (args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net');
        await sock.groupParticipantsUpdate(from, [target], 'remove');
        await sock.sendMessage(from, { text: 'User berhasil dikick' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal kick user' }, { quoted: msg });
      }
      return true;

    case 'add':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.add 6281234567890\n.add +6281234567890\n\n📝 *Contoh:*\n.add 6281234567890\n.add +6281234567890' }, { quoted: msg });
        return true;
      }
      try {
        const target = args[0]?.replace('+', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(from, [target], 'add');
        await sock.sendMessage(from, { text: 'User berhasil ditambahkan' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menambah user' }, { quoted: msg });
      }
      return true;

    case 'promote':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0] && !quotedParticipant) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.promote @6281234567890\nReply pesan user lalu ketik .promote\n\n📝 *Contoh:*\n.promote @6281234567890\n(Reply pesan user) .promote' }, { quoted: msg });
        return true;
      }
      try {
        let target = quotedParticipant || (args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net');
        await sock.groupParticipantsUpdate(from, [target], 'promote');
        await sock.sendMessage(from, { text: 'User berhasil dipromote' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal promote user' }, { quoted: msg });
      }
      return true;

    case 'demote':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0] && !quotedParticipant) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.demote @6281234567890\nReply pesan user lalu ketik .demote\n\n📝 *Contoh:*\n.demote @6281234567890\n(Reply pesan user) .demote' }, { quoted: msg });
        return true;
      }
      try {
        let target = quotedParticipant || (args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net');
        await sock.groupParticipantsUpdate(from, [target], 'demote');
        await sock.sendMessage(from, { text: 'User berhasil didemote' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal demote user' }, { quoted: msg });
      }
      return true;

    case 'hidetag':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        const metadata = await getGroupMetadata(sock, from);
        const participants = metadata.participants.map(p => p.id);
        const text = args.join(' ') || 'Hidetag';
        await sock.sendMessage(from, { text: text, mentions: participants });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal hidetag' }, { quoted: msg });
      }
      return true;

    case 'tagall':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        const metadata = await getGroupMetadata(sock, from);
        const participants = metadata.participants.map(p => p.id);
        const text = args.join(' ') || 'Tag All';
        await sock.sendMessage(from, { text: text, mentions: participants });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal tagall' }, { quoted: msg });
      }
      return true;

    case 'groupopen':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        await sock.groupSettingUpdate(from, 'not_announcement');
        await sock.sendMessage(from, { text: 'Group dibuka' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal membuka group' }, { quoted: msg });
      }
      return true;

    case 'groupclose':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        await sock.groupSettingUpdate(from, 'announcement');
        await sock.sendMessage(from, { text: 'Group ditutup' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menutup group' }, { quoted: msg });
      }
      return true;

    case 'groupname':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.groupname Nama Group Baru\n\n📝 *Contoh:*\n.groupname Group Bot Express\n.groupname Grup Diskusi' }, { quoted: msg });
        return true;
      }
      try {
        const name = args.join(' ');
        await sock.groupUpdateSubject(from, name);
        await sock.sendMessage(from, { text: `Nama group diubah menjadi: ${name}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mengubah nama group' }, { quoted: msg });
      }
      return true;

    case 'groupdesc':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.groupdesc Deskripsi group baru\n\n📝 *Contoh:*\n.groupdesc Group untuk diskusi bot\n.groupdesc Grup resmi Bot Express' }, { quoted: msg });
        return true;
      }
      try {
        const desc = args.join(' ');
        await sock.groupUpdateDescription(from, desc);
        await sock.sendMessage(from, { text: `Deskripsi group diubah menjadi: ${desc}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mengubah deskripsi group' }, { quoted: msg });
      }
      return true;

    case 'revokelink':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        await sock.groupRevokeInvite(from);
        await sock.sendMessage(from, { text: 'Link group berhasil direset' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal reset link' }, { quoted: msg });
      }
      return true;

    case 'getlink':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        const code = await sock.groupInviteCode(from);
        await sock.sendMessage(from, { text: `https://chat.whatsapp.com/${code}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan link' }, { quoted: msg });
      }
      return true;

    case 'antilink':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        const groups = readJSON('groups.json');
        if (!groups[from]) groups[from] = {};
        groups[from].antilink = !groups[from].antilink;
        writeJSON('groups.json', groups);
        await sock.sendMessage(from, { text: `Antilink ${groups[from].antilink ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mengubah antilink' }, { quoted: msg });
      }
      return true;

    case 'welcome':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        const groups = readJSON('groups.json');
        if (!groups[from]) groups[from] = {};
        groups[from].welcome = !groups[from].welcome;
        writeJSON('groups.json', groups);
        await sock.sendMessage(from, { text: `Welcome ${groups[from].welcome ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mengubah welcome' }, { quoted: msg });
      }
      return true;

    case 'goodbye':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      try {
        const groups = readJSON('groups.json');
        if (!groups[from]) groups[from] = {};
        groups[from].goodbye = !groups[from].goodbye;
        writeJSON('groups.json', groups);
        await sock.sendMessage(from, { text: `Goodbye ${groups[from].goodbye ? 'diaktifkan' : 'dinonaktifkan'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mengubah goodbye' }, { quoted: msg });
      }
      return true;

    case 'warn':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0] && !quotedParticipant) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.warn @6281234567890\nReply pesan user lalu ketik .warn\n\n📝 *Contoh:*\n.warn @6281234567890\n(Reply pesan user) .warn' }, { quoted: msg });
        return true;
      }
      try {
        const target = quotedParticipant || (args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net');
        const warns = readJSON('warns.json');
        if (!warns[from]) warns[from] = {};
        if (!warns[from][target]) warns[from][target] = 0;
        warns[from][target]++;
        writeJSON('warns.json', warns);
        await sock.sendMessage(from, { text: `User mendapat warning (${warns[from][target]}/3)` }, { quoted: msg });
        if (warns[from][target] >= 3) {
          await sock.groupParticipantsUpdate(from, [target], 'remove');
          await sock.sendMessage(from, { text: 'User dikick karena mencapai 3 warnings' });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal warn user' }, { quoted: msg });
      }
      return true;

    case 'unwarn':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0] && !quotedParticipant) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.unwarn @6281234567890\nReply pesan user lalu ketik .unwarn\n\n📝 *Contoh:*\n.unwarn @6281234567890\n(Reply pesan user) .unwarn' }, { quoted: msg });
        return true;
      }
      try {
        const target = quotedParticipant || (args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net');
        const warns = readJSON('warns.json');
        if (warns[from] && warns[from][target]) {
          warns[from][target] = Math.max(0, warns[from][target] - 1);
          writeJSON('warns.json', warns);
          await sock.sendMessage(from, { text: 'Warning dikurangi' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal unwarn user' }, { quoted: msg });
      }
      return true;

    case 'mute':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0] && !quotedParticipant) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.mute @6281234567890 60\n.mute @6281234567890\nReply pesan user lalu ketik .mute 60\n\n📝 *Contoh:*\n.mute @6281234567890 60\n(Reply pesan user) .mute 30' }, { quoted: msg });
        return true;
      }
      try {
        const target = quotedParticipant || (args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net');
        const mutes = readJSON('mutes.json');
        if (!mutes[from]) mutes[from] = {};
        const duration = parseInt(quotedParticipant ? args[0] : args[1]) || 60;
        mutes[from][target] = Date.now() + (duration * 60000);
        writeJSON('mutes.json', mutes);
        await sock.sendMessage(from, { text: `User di-mute selama ${duration} menit` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mute user' }, { quoted: msg });
      }
      return true;

    case 'unmute':
      if (!isOwner(sender) && !isAdmin(sender)) return false;
      if (!args[0] && !quotedParticipant) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.unmute @6281234567890\nReply pesan user lalu ketik .unmute\n\n📝 *Contoh:*\n.unmute @6281234567890\n(Reply pesan user) .unmute' }, { quoted: msg });
        return true;
      }
      try {
        const target = quotedParticipant || (args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net');
        const mutes = readJSON('mutes.json');
        if (mutes[from] && mutes[from][target]) {
          delete mutes[from][target];
          writeJSON('mutes.json', mutes);
          await sock.sendMessage(from, { text: 'User di-unmute' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal unmute user' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleGroup };

