const { downloadMedia } = require('../../lib/functions');
const axios = require('axios');
const FormData = require('form-data');

async function handleTools(sock, msg, cmd, args, from, quoted) {
  switch (cmd) {
    case 'sticker':
      try {
        if (msg.message.imageMessage) {
          const media = await downloadMedia(sock, msg);
          await sock.sendMessage(from, { sticker: media }, { quoted: msg });
        } else if (msg.message.videoMessage) {
          const media = await downloadMedia(sock, msg);
          await sock.sendMessage(from, { sticker: media }, { quoted: msg });
        } else if (quoted && quoted.imageMessage) {
          const media = await downloadMedia(sock, { message: quoted });
          await sock.sendMessage(from, { sticker: media }, { quoted: msg });
        } else if (quoted && quoted.videoMessage) {
          const media = await downloadMedia(sock, { message: quoted });
          await sock.sendMessage(from, { sticker: media }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Reply gambar/video atau kirim gambar/video dengan caption .sticker' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal membuat sticker' }, { quoted: msg });
      }
      return true;

    case 'stickertoimg':
      try {
        if (msg.message.stickerMessage) {
          const media = await downloadMedia(sock, msg);
          await sock.sendMessage(from, { image: media }, { quoted: msg });
        } else if (quoted && quoted.stickerMessage) {
          const media = await downloadMedia(sock, { message: quoted });
          await sock.sendMessage(from, { image: media }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Reply sticker atau kirim sticker dengan caption .stickertoimg' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal convert sticker' }, { quoted: msg });
      }
      return true;

    case 'tourl':
      try {
        if (msg.message.imageMessage || msg.message.videoMessage || msg.message.audioMessage || msg.message.documentMessage) {
          const media = await downloadMedia(sock, msg);
          const form = new FormData();
          form.append('file', media, 'media');
          const res = await axios.post('https://file.io', form, { headers: form.getHeaders() });
          if (res.data.success) {
            await sock.sendMessage(from, { text: res.data.link }, { quoted: msg });
          } else {
            await sock.sendMessage(from, { text: 'Gagal upload' }, { quoted: msg });
          }
        } else {
          await sock.sendMessage(from, { text: 'Reply media atau kirim media dengan caption .tourl' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal convert to URL' }, { quoted: msg });
      }
      return true;

    case 'shortlink':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.shortlink https://example.com\n\n📝 *Contoh:*\n.shortlink https://www.google.com\n.shortlink https://github.com' }, { quoted: msg });
        return true;
      }
      try {
        const url = args[0];
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${url}`);
        await sock.sendMessage(from, { text: res.data }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal membuat shortlink' }, { quoted: msg });
      }
      return true;

    case 'calc':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.calc 10 + 5\n.calc 100 * 2\n\n📝 *Contoh:*\n.calc 10 + 5\n.calc 100 * 2\n.calc (50 + 30) / 2' }, { quoted: msg });
        return true;
      }
      try {
        const expr = args.join(' ');
        const result = eval(expr.replace(/[^0-9+\-*/().\s]/g, ''));
        await sock.sendMessage(from, { text: `${expr} = ${result}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Ekspresi tidak valid' }, { quoted: msg });
      }
      return true;

    case 'translate':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.translate Halo dunia\n.translate Hello world\n\n📝 *Contoh:*\n.translate Halo dunia\n.translate Hello world\n.translate Selamat pagi' }, { quoted: msg });
        return true;
      }
      try {
        const text = args.join(' ');
        const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`);
        if (res.data.responseData) {
          await sock.sendMessage(from, { text: res.data.responseData.translatedText }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal translate' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal translate' }, { quoted: msg });
      }
      return true;

    case 'tts':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.tts Halo selamat pagi\n.tts Hello world\n\n📝 *Contoh:*\n.tts Halo selamat pagi\n.tts Hello world\n.tts Ini adalah contoh text to speech' }, { quoted: msg });
        return true;
      }
      try {
        const text = args.join(' ');
        const res = await axios.get(`https://api.voicerss.org/?key=YOUR_KEY&hl=id-id&src=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
        await sock.sendMessage(from, { audio: res.data, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal membuat TTS' }, { quoted: msg });
      }
      return true;

    case 'qrcode':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.qrcode https://example.com\n.qrcode Hello World\n\n📝 *Contoh:*\n.qrcode https://www.google.com\n.qrcode Hello World\n.qrcode 6281234567890' }, { quoted: msg });
        return true;
      }
      try {
        const text = args.join(' ');
        const qr = require('qrcode');
        const qrCode = await qr.toDataURL(text);
        await sock.sendMessage(from, { image: { url: qrCode } }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal membuat QR code' }, { quoted: msg });
      }
      return true;

    case 'reminder':
      try {
        const time = args[0];
        const message = args.slice(1).join(' ');
        if (!time || !message) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.reminder 10:00 Meeting penting\n.reminder 15:30 Beli susu\n\n📝 *Contoh:*\n.reminder 10:00 Meeting penting\n.reminder 15:30 Beli susu\n.reminder 20:00 Call dengan client' }, { quoted: msg });
          return true;
        }
        const reminders = require('../../lib/functions').readJSON('reminders.json');
        const reminderId = Date.now().toString();
        reminders[reminderId] = {
          userId: from,
          time: time,
          message: message,
          createdAt: new Date().toISOString()
        };
        require('../../lib/functions').writeJSON('reminders.json', reminders);
        await sock.sendMessage(from, { text: 'Reminder berhasil dibuat' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal membuat reminder' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleTools };

