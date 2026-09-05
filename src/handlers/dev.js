const { getQuotedMessage, getMessage, getQuotedText } = require('../../lib/functions');
const { triggerN8nWebhook } = require('../integrations/n8n');

async function handleDev(sock, msg, cmd, args, from, sender) {
  switch (cmd) {
    case 'jsonfmt':
      try {
        const quotedText = getQuotedText(msg);
        const text = quotedText || getMessage(msg);
        
        if (!text) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\nReply pesan JSON lalu ketik .jsonfmt\n\n📝 *Contoh:*\n(Reply JSON) .jsonfmt' }, { quoted: msg });
          return true;
        }
        
        try {
          const jsonData = JSON.parse(text);
          const formatted = JSON.stringify(jsonData, null, 2);
          await sock.sendMessage(from, { text: `\`\`\`json\n${formatted}\n\`\`\`` }, { quoted: msg });
        } catch (e) {
          await sock.sendMessage(from, { text: '❌ JSON tidak valid' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal format JSON' }, { quoted: msg });
      }
      return true;

    case 'trigger':
      if (args.length < 2) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.trigger event_name Pesan untuk webhook\n\n📝 *Contoh:*\n.trigger test_event Hello from WhatsApp\n.trigger notification User melakukan action' }, { quoted: msg });
        return true;
      }
      try {
        const eventName = args[0];
        const message = args.slice(1).join(' ');
        const result = await triggerN8nWebhook(eventName, message, sender, {
          from: from,
          timestamp: new Date().toISOString()
        });
        
        if (result.success) {
          await sock.sendMessage(from, { text: `✅ Webhook berhasil dikirim\nEvent: ${eventName}` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: `❌ Gagal mengirim webhook: ${result.error}` }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal trigger webhook' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleDev };

