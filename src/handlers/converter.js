const { downloadMedia } = require('../../lib/functions');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');

async function handleConverter(sock, msg, cmd, args, from, quoted) {
  switch (cmd) {
    case 'img2pdf':
      try {
        let imageBuffer = null;
        
        if (msg.message.imageMessage) {
          imageBuffer = await downloadMedia(sock, msg);
        } else if (quoted && quoted.imageMessage) {
          imageBuffer = await downloadMedia(sock, { message: quoted });
        } else {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\nReply gambar lalu ketik .img2pdf\nKirim gambar dengan caption .img2pdf\n\n📝 *Contoh:*\n(Reply gambar) .img2pdf' }, { quoted: msg });
          return true;
        }
        
        const pdfPath = path.join(__dirname, '../../temp', `pdf_${Date.now()}.pdf`);
        if (!fs.existsSync(path.join(__dirname, '../../temp'))) {
          fs.mkdirSync(path.join(__dirname, '../../temp'), { recursive: true });
        }
        
        const doc = new PDFDocument({ size: 'A4' });
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);
        doc.image(imageBuffer, {
          fit: [500, 700],
          align: 'center',
          valign: 'center'
        });
        doc.end();
        
        await new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
        });
        
        const pdfBuffer = fs.readFileSync(pdfPath);
        await sock.sendMessage(from, { document: pdfBuffer, mimetype: 'application/pdf', fileName: 'image.pdf' }, { quoted: msg });
        fs.unlinkSync(pdfPath);
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal convert ke PDF' }, { quoted: msg });
      }
      return true;

    case 'ssweb':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.ssweb https://example.com\n\n📝 *Contoh:*\n.ssweb https://www.google.com\n.ssweb https://github.com' }, { quoted: msg });
        return true;
      }
      try {
        const url = args[0];
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          await sock.sendMessage(from, { text: 'URL harus dimulai dengan http:// atau https://' }, { quoted: msg });
          return true;
        }
        
        await sock.sendMessage(from, { text: '⏳ Sedang mengambil screenshot...' }, { quoted: msg });
        
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        const screenshot = await page.screenshot({ type: 'png', fullPage: false });
        await browser.close();
        
        await sock.sendMessage(from, { image: screenshot }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mengambil screenshot: ' + e.message }, { quoted: msg });
      }
      return true;

    case 'ai':
      if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.ai Apa itu JavaScript?\n.ai Jelaskan tentang AI\n\n📝 *Contoh:*\n.ai Apa itu JavaScript?\n.ai Buatkan kode hello world' }, { quoted: msg });
        return true;
      }
      try {
        const question = args.join(' ');
        const config = require('../../config');
        
        if (config.groqApiKey) {
          const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.1-70b-versatile',
            messages: [{ role: 'user', content: question }],
            temperature: 0.7
          }, {
            headers: {
              'Authorization': `Bearer ${config.groqApiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (res.data.choices && res.data.choices[0]) {
            await sock.sendMessage(from, { text: res.data.choices[0].message.content }, { quoted: msg });
          } else {
            await sock.sendMessage(from, { text: 'Gagal mendapatkan response AI' }, { quoted: msg });
          }
        } else if (config.openaiApiKey) {
          const res = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: question }]
          }, {
            headers: { 'Authorization': `Bearer ${config.openaiApiKey}` }
          });
          
          if (res.data.choices && res.data.choices[0]) {
            await sock.sendMessage(from, { text: res.data.choices[0].message.content }, { quoted: msg });
          } else {
            await sock.sendMessage(from, { text: 'Gagal mendapatkan response AI' }, { quoted: msg });
          }
        } else {
          await sock.sendMessage(from, { text: 'API Key tidak dikonfigurasi. Set OPENAI_API_KEY atau GROQ_API_KEY di .env' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal chat AI: ' + e.message }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleConverter };

