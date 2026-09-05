const axios = require('axios');

async function handleDownloader(sock, msg, cmd, args, from) {
  switch (cmd) {
    case 'tiktok':
      if (!args[0]) return false;
      try {
        const url = args[0];
        const res = await axios.get(`https://api.tiktokv.com/aweme/v1/play/?video_id=${url}`);
        if (res.data.video_url) {
          await sock.sendMessage(from, { video: { url: res.data.video_url } }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal download TikTok' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal download TikTok' }, { quoted: msg });
      }
      return true;

    case 'ig':
      if (!args[0]) return false;
      try {
        const url = args[0];
        const res = await axios.get(`https://api.instagram.com/api/v1/media/${url}/info/`);
        if (res.data.items && res.data.items[0].video_versions) {
          await sock.sendMessage(from, { video: { url: res.data.items[0].video_versions[0].url } }, { quoted: msg });
        } else if (res.data.items && res.data.items[0].image_versions2) {
          await sock.sendMessage(from, { image: { url: res.data.items[0].image_versions2.candidates[0].url } }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal download IG' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal download IG' }, { quoted: msg });
      }
      return true;

    case 'ytmp3':
      if (!args[0]) return false;
      try {
        const url = args[0];
        const res = await axios.get(`https://api.yt-downloader.com/api/info?url=${url}`);
        if (res.data.audio) {
          await sock.sendMessage(from, { audio: { url: res.data.audio }, mimetype: 'audio/mp4' }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal download YT MP3' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal download YT MP3' }, { quoted: msg });
      }
      return true;

    case 'ytmp4':
      if (!args[0]) return false;
      try {
        const url = args[0];
        const res = await axios.get(`https://api.yt-downloader.com/api/info?url=${url}`);
        if (res.data.video) {
          await sock.sendMessage(from, { video: { url: res.data.video } }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal download YT MP4' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal download YT MP4' }, { quoted: msg });
      }
      return true;

    case 'fb':
      if (!args[0]) return false;
      try {
        const url = args[0];
        const res = await axios.get(`https://api.fbdown.net/downloader?URL=${url}`);
        if (res.data.links && res.data.links.HD) {
          await sock.sendMessage(from, { video: { url: res.data.links.HD } }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal download FB' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal download FB' }, { quoted: msg });
      }
      return true;

    case 'twitter':
      if (!args[0]) return false;
      try {
        const url = args[0];
        const res = await axios.get(`https://api.twitter.com/1.1/statuses/show.json?id=${url}`);
        if (res.data.extended_entities && res.data.extended_entities.media) {
          const media = res.data.extended_entities.media[0];
          if (media.type === 'video') {
            await sock.sendMessage(from, { video: { url: media.video_info.variants[0].url } }, { quoted: msg });
          } else {
            await sock.sendMessage(from, { image: { url: media.media_url_https } }, { quoted: msg });
          }
        } else {
          await sock.sendMessage(from, { text: 'Gagal download Twitter' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal download Twitter' }, { quoted: msg });
      }
      return true;

    case 'pinterest':
      if (!args[0]) return false;
      try {
        const url = args[0];
        const res = await axios.get(url);
        const match = res.data.match(/<meta property="og:image" content="([^"]+)"/);
        if (match && match[1]) {
          await sock.sendMessage(from, { image: { url: match[1] } }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal download Pinterest' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal download Pinterest' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleDownloader };

