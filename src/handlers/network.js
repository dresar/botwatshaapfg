const axios = require('axios');

async function handleNetwork(sock, msg, cmd, args, from) {
  switch (cmd) {
    case 'cekip':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.cekip 8.8.8.8\n.cekip 1.1.1.1\n\n📝 *Contoh:*\n.cekip 8.8.8.8\n.cekip 1.1.1.1' }, { quoted: msg });
        return true;
      }
      try {
        const ip = args[0];
        const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,timezone,lat,lon,proxy,query`);
        
        if (res.data.status === 'fail') {
          await sock.sendMessage(from, { text: `❌ Gagal: ${res.data.message}` }, { quoted: msg });
          return true;
        }
        
        const ipInfo = `*🌐 IP Information*\n\n*IP Address:* ${res.data.query}\n*Negara:* ${res.data.country}\n*Kota:* ${res.data.city}\n*Region:* ${res.data.regionName}\n*ISP:* ${res.data.isp}\n*Timezone:* ${res.data.timezone}\n*Koordinat:* ${res.data.lat}, ${res.data.lon}\n*Proxy:* ${res.data.proxy ? 'Ya' : 'Tidak'}`;
        await sock.sendMessage(from, { text: ipInfo }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan informasi IP' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleNetwork };

