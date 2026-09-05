const { readJSON, isOwner, isAdmin } = require('../../lib/functions');
const config = require('../../config');

async function handleMenu(sock, msg, cmd, args, from, sender) {
  if (cmd !== 'menu') return false;

  const isOwnerUser = isOwner(sender);
  const isAdminUser = isAdmin(sender);
  
  console.log('Menu check:', { 
    sender, 
    isOwner: isOwnerUser, 
    isAdmin: isAdminUser,
    configOwner: require('../../config').owner
  });

  if (isOwnerUser) {
    const ownerMenu = `╔═══════════════════════════╗
║   🤖 *MENU OWNER* 🤖   ║
╚═══════════════════════════╝

┌─ 📋 *GROUP COMMANDS* ─┐
│
│  🚫 .kick [@user]
│     └─ Kick user dari group
│
│  ➕ .add [nomor]
│     └─ Tambah user ke group
│
│  ⬆️  .promote [@user]
│     └─ Promote jadi admin
│
│  ⬇️  .demote [@user]
│     └─ Demote dari admin
│
│  👻 .hidetag [text]
│     └─ Hidetag semua member
│
│  📢 .tagall [text]
│     └─ Tag semua member
│
│  🔓 .groupopen
│     └─ Buka group
│
│  🔒 .groupclose
│     └─ Tutup group
│
│  ✏️  .groupname [nama]
│     └─ Ubah nama group
│
│  📝 .groupdesc [desc]
│     └─ Ubah deskripsi
│
│  🔄 .revokelink
│     └─ Reset link group
│
│  🔗 .getlink
│     └─ Dapatkan link group
│
│  🚫 .antilink
│     └─ Toggle antilink
│
│  👋 .welcome
│     └─ Toggle welcome
│
│  👋 .goodbye
│     └─ Toggle goodbye
│
│  ⚠️  .warn [@user]
│     └─ Warn user
│
│  ✅ .unwarn [@user]
│     └─ Hapus warn
│
│  🔇 .mute [@user] [menit]
│     └─ Mute user
│
│  🔊 .unmute [@user]
│     └─ Unmute user
│
└─────────────────────────┘

┌─ 👤 *USER MANAGEMENT* ─┐
│
│  🚫 .blacklist [@user]
│     └─ Blacklist user
│
│  ✅ .unblacklist [@user]
│     └─ Unblacklist user
│
│  ✅ .whitelist [@user]
│     └─ Whitelist user
│
│  🚫 .unwhitelist [@user]
│     └─ Unwhitelist user
│
│  🤖 .setautoreply [@user] [on/off] [reply]
│     └─ Set auto-reply per user
│
│  ➕ .addadmin [@user]
│     └─ Tambah admin
│
│  ➖ .deladmin [@user]
│     └─ Hapus admin
│
│  📋 .listadmin
│     └─ List semua admin
│
└─────────────────────────┘

┌─ 🛠️ *TOOLS* ─┐
│
│  🎨 .sticker
│     └─ Buat sticker
│
│  🖼️  .stickertoimg
│     └─ Convert sticker ke gambar
│
│  🔗 .tourl
│     └─ Convert media ke URL
│
│  🔗 .shortlink [url]
│     └─ Buat shortlink
│
│  🧮 .calc [ekspresi]
│     └─ Kalkulator
│
│  🌐 .translate [text]
│     └─ Translate text
│
│  🔊 .tts [text]
│     └─ Text to speech
│
│  📱 .qrcode [text]
│     └─ Buat QR code
│
│  ⏰ .reminder [waktu] [pesan]
│     └─ Buat reminder
│
└─────────────────────────┘

┌─ 🤖 *AI* ─┐
│
│  💬 .chat [text]
│     └─ Chat dengan AI
│
│  🎨 .dalle [prompt]
│     └─ Generate gambar AI
│
└─────────────────────────┘

┌─ 📝 *USER TOOLS* ─┐
│
│  👤 .profile
│     └─ Lihat profile
│
│  📝 .note [nama] [isi]
│     └─ Simpan note
│
│  📋 .notes
│     └─ Lihat semua notes
│
│  🗑️  .delnote [nama]
│     └─ Hapus note
│
│  😴 .afk [alasan]
│     └─ Set AFK
│
│  😊 .unafk
│     └─ Unset AFK
│
└─────────────────────────┘

┌─ ⚙️ *SYSTEM* ─┐
│
│  ⏱️  .runtime
│     └─ Cek runtime bot
│
│  📡 .ping
│     └─ Test ping
│
│  ⚡ .speed
│     └─ Test speed
│
│  📊 .stats
│     └─ Bot statistics
│
│  📈 .level
│     └─ Cek level dan EXP
│
│  ➕ .addautoreply [key] [value]
│     └─ Tambah auto-reply
│
│  ➖ .delautoreply [key]
│     └─ Hapus auto-reply
│
│  📋 .listautoreply
│     └─ List auto-reply
│
│  🔑 .genapikey [nama]
│     └─ Generate API key baru
│
│  📋 .listapikey
│     └─ List semua API keys
│
│  🗑️  .delapikey [key]
│     └─ Hapus API key
│
└─────────────────────────┘

╔═══════════════════════════╗
║  Prefix: *${config.prefix}*  ║
╚═══════════════════════════╝`;

    await sock.sendMessage(from, { text: ownerMenu }, { quoted: msg });
    return true;
  }

  if (isAdminUser) {
    const adminMenu = `╔═══════════════════════════╗
║   👑 *MENU ADMIN* 👑   ║
╚═══════════════════════════╝

┌─ 📋 *GROUP COMMANDS* ─┐
│
│  🚫 .kick [@user]
│     └─ Kick user dari group
│
│  ➕ .add [nomor]
│     └─ Tambah user ke group
│
│  ⬆️  .promote [@user]
│     └─ Promote jadi admin
│
│  ⬇️  .demote [@user]
│     └─ Demote dari admin
│
│  👻 .hidetag [text]
│     └─ Hidetag semua member
│
│  📢 .tagall [text]
│     └─ Tag semua member
│
│  🔓 .groupopen
│     └─ Buka group
│
│  🔒 .groupclose
│     └─ Tutup group
│
│  ✏️  .groupname [nama]
│     └─ Ubah nama group
│
│  📝 .groupdesc [desc]
│     └─ Ubah deskripsi
│
│  🔄 .revokelink
│     └─ Reset link group
│
│  🔗 .getlink
│     └─ Dapatkan link group
│
│  🚫 .antilink
│     └─ Toggle antilink
│
│  👋 .welcome
│     └─ Toggle welcome
│
│  👋 .goodbye
│     └─ Toggle goodbye
│
│  ⚠️  .warn [@user]
│     └─ Warn user
│
│  ✅ .unwarn [@user]
│     └─ Hapus warn
│
│  🔇 .mute [@user] [menit]
│     └─ Mute user
│
│  🔊 .unmute [@user]
│     └─ Unmute user
│
└─────────────────────────┘

┌─ 🛠️ *TOOLS* ─┐
│
│  🎨 .sticker
│     └─ Buat sticker
│
│  🖼️  .stickertoimg
│     └─ Convert sticker ke gambar
│
│  🔗 .tourl
│     └─ Convert media ke URL
│
│  🔗 .shortlink [url]
│     └─ Buat shortlink
│
│  🧮 .calc [ekspresi]
│     └─ Kalkulator
│
│  🌐 .translate [text]
│     └─ Translate text
│
│  🔊 .tts [text]
│     └─ Text to speech
│
│  📱 .qrcode [text]
│     └─ Buat QR code
│
│  ⏰ .reminder [waktu] [pesan]
│     └─ Buat reminder
│
└─────────────────────────┘

┌─ 🤖 *AI* ─┐
│
│  💬 .chat [text]
│     └─ Chat dengan AI
│
│  🎨 .dalle [prompt]
│     └─ Generate gambar AI
│
└─────────────────────────┘

┌─ 📝 *USER TOOLS* ─┐
│
│  👤 .profile
│     └─ Lihat profile
│
│  📝 .note [nama] [isi]
│     └─ Simpan note
│
│  📋 .notes
│     └─ Lihat semua notes
│
│  🗑️  .delnote [nama]
│     └─ Hapus note
│
│  😴 .afk [alasan]
│     └─ Set AFK
│
│  😊 .unafk
│     └─ Unset AFK
│
└─────────────────────────┘

┌─ ⚙️ *SYSTEM* ─┐
│
│  ⏱️  .runtime
│     └─ Cek runtime bot
│
│  📡 .ping
│     └─ Test ping
│
│  ⚡ .speed
│     └─ Test speed
│
│  📊 .stats
│     └─ Bot statistics
│
│  📈 .level
│     └─ Cek level dan EXP
│
│  🔑 .genapikey [nama]
│     └─ Generate API key baru
│
│  📋 .listapikey
│     └─ List semua API keys
│
│  🗑️  .delapikey [key]
│     └─ Hapus API key
│
└─────────────────────────┘

╔═══════════════════════════╗
║  Prefix: *${config.prefix}*  ║
╚═══════════════════════════╝`;

    await sock.sendMessage(from, { text: adminMenu }, { quoted: msg });
    return true;
  }

  const userMenu = `╔═══════════════════════════╗
║   👤 *MENU USER* 👤   ║
╚═══════════════════════════╝

┌─ 🎮 *GAMES* ─┐
│
│  🔢 .tebakangka [angka]
│     └─ Tebak angka 1-100
│
│  ✂️  .suit [batu/kertas/gunting]
│     └─ Main suit
│
│  🧮 .math
│     └─ Soal matematika
│
│  💭 .jawab [jawaban]
│     └─ Jawab soal math
│
│  ❓ .trivia
│     └─ Main trivia
│
│  💡 .jawabtrivia [jawaban]
│     └─ Jawab trivia
│
└─────────────────────────┘

┌─ 🎉 *FUN* ─┐
│
│  😂 .joke
│     └─ Random joke
│
│  📚 .fact
│     └─ Random fact
│
│  💬 .quote
│     └─ Random quote
│
│  ➕ .addquote [quote]
│     └─ Tambah quote
│
│  🌤️  .weather [kota]
│     └─ Cek cuaca
│
│  📰 .news
│     └─ Berita terbaru
│
│  💍 .marry [@user]
│     └─ Menikah
│
│  💔 .divorce
│     └─ Bercerai
│
│  🏆 .achievement
│     └─ Lihat achievement
│
│  🐉 .khodam
│     └─ Cek khodam
│
│  💕 .jodoh
│     └─ Cek jodoh
│
│  🐚 .kerang [pertanyaan]
│     └─ Kerang ajaib
│
│  💯 .truth
│     └─ Truth challenge
│
│  🎯 .dare
│     └─ Dare challenge
│
│  🖼️  .tebakgambar
│     └─ Tebak gambar
│
│  📝 .tebakkata
│     └─ Tebak kata
│
└─────────────────────────┘

┌─ 🛠️ *TOOLS* ─┐
│
│  🎨 .sticker
│     └─ Buat sticker
│
│  🖼️  .stickertoimg
│     └─ Convert sticker ke gambar
│
│  🔗 .tourl
│     └─ Convert media ke URL
│
│  🔗 .shortlink [url]
│     └─ Buat shortlink
│
│  🧮 .calc [ekspresi]
│     └─ Kalkulator
│
│  🌐 .translate [text]
│     └─ Translate text
│
│  🔊 .tts [text]
│     └─ Text to speech
│
│  📱 .qrcode [text]
│     └─ Buat QR code
│
│  ⏰ .reminder [waktu] [pesan]
│     └─ Buat reminder
│
└─────────────────────────┘

┌─ 🤖 *AI* ─┐
│
│  💬 .chat [text]
│     └─ Chat dengan AI
│
│  🎨 .dalle [prompt]
│     └─ Generate gambar AI
│
└─────────────────────────┘

┌─ 📝 *USER TOOLS* ─┐
│
│  👤 .profile
│     └─ Lihat profile
│
│  📝 .note [nama] [isi]
│     └─ Simpan note
│
│  📋 .notes
│     └─ Lihat semua notes
│
│  🗑️  .delnote [nama]
│     └─ Hapus note
│
│  😴 .afk [alasan]
│     └─ Set AFK
│
│  😊 .unafk
│     └─ Unset AFK
│
└─────────────────────────┘

┌─ ⚙️ *SYSTEM* ─┐
│
│  ⏱️  .runtime
│     └─ Cek runtime bot
│
│  📡 .ping
│     └─ Test ping
│
│  ⚡ .speed
│     └─ Test speed
│
│  📊 .stats
│     └─ Bot statistics
│
│  📈 .level
│     └─ Cek level dan EXP
│
└─────────────────────────┘

╔═══════════════════════════╗
║  Prefix: *${config.prefix}*  ║
╚═══════════════════════════╝`;

  await sock.sendMessage(from, { text: userMenu }, { quoted: msg });
  return true;
}

module.exports = { handleMenu };
