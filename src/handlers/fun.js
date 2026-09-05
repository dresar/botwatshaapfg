const { readJSON, writeJSON } = require('../../lib/functions');
const axios = require('axios');

async function handleFun(sock, msg, cmd, args, from, sender) {
  switch (cmd) {
    case 'joke':
      try {
        const jokes = readJSON('jokes.json');
        const jokeList = Object.values(jokes);
        if (jokeList.length === 0) {
          await sock.sendMessage(from, { text: 'Tidak ada joke tersedia' }, { quoted: msg });
          return true;
        }
        const randomJoke = jokeList[Math.floor(Math.random() * jokeList.length)];
        await sock.sendMessage(from, { text: randomJoke }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan joke' }, { quoted: msg });
      }
      return true;

    case 'fact':
      try {
        const facts = readJSON('facts.json');
        const factList = Object.values(facts);
        if (factList.length === 0) {
          await sock.sendMessage(from, { text: 'Tidak ada fact tersedia' }, { quoted: msg });
          return true;
        }
        const randomFact = factList[Math.floor(Math.random() * factList.length)];
        await sock.sendMessage(from, { text: `*Fact:*\n${randomFact}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan fact' }, { quoted: msg });
      }
      return true;

    case 'quote':
      try {
        const quotes = readJSON('quotesdb.json');
        const quoteList = Object.values(quotes);
        if (quoteList.length === 0) {
          await sock.sendMessage(from, { text: 'Tidak ada quote tersedia' }, { quoted: msg });
          return true;
        }
        const randomQuote = quoteList[Math.floor(Math.random() * quoteList.length)];
        await sock.sendMessage(from, { text: `*Quote:*\n"${randomQuote}"` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan quote' }, { quoted: msg });
      }
      return true;

    case 'addquote':
      try {
        const quote = args.join(' ');
        if (!quote) {
          await sock.sendMessage(from, { text: 'Format: !addquote [quote]' }, { quoted: msg });
          return true;
        }
        const quotes = readJSON('quotesdb.json');
        const id = Date.now().toString();
        quotes[id] = quote;
        writeJSON('quotesdb.json', quotes);
        await sock.sendMessage(from, { text: 'Quote berhasil ditambahkan' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menambah quote' }, { quoted: msg });
      }
      return true;

    case 'weather':
      try {
        const city = args.join(' ') || 'Jakarta';
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`);
        if (res.data) {
          const weather = `*Cuaca di ${city}:*\nSuhu: ${res.data.main.temp}°C\nKondisi: ${res.data.weather[0].description}\nKelembaban: ${res.data.main.humidity}%`;
          await sock.sendMessage(from, { text: weather }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal mendapatkan cuaca' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan cuaca' }, { quoted: msg });
      }
      return true;

    case 'news':
      try {
        const res = await axios.get('https://newsapi.org/v2/top-headlines?country=id&apiKey=YOUR_API_KEY');
        if (res.data && res.data.articles) {
          const article = res.data.articles[0];
          await sock.sendMessage(from, { text: `*Berita:*\n${article.title}\n\n${article.description}\n\n${article.url}` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Gagal mendapatkan berita' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan berita' }, { quoted: msg });
      }
      return true;

    case 'marry':
      try {
        const target = args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        if (!target) {
          await sock.sendMessage(from, { text: 'Format: !marry [@user]' }, { quoted: msg });
          return true;
        }
        const marriage = readJSON('marriage.json');
        if (marriage[sender] || marriage[target]) {
          await sock.sendMessage(from, { text: 'Salah satu sudah menikah' }, { quoted: msg });
          return true;
        }
        marriage[sender] = target;
        marriage[target] = sender;
        writeJSON('marriage.json', marriage);
        await sock.sendMessage(from, { text: `Selamat! ${sender} dan ${target} telah menikah!` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal marry' }, { quoted: msg });
      }
      return true;

    case 'divorce':
      try {
        const marriage = readJSON('marriage.json');
        if (!marriage[sender]) {
          await sock.sendMessage(from, { text: 'Anda belum menikah' }, { quoted: msg });
          return true;
        }
        const partner = marriage[sender];
        delete marriage[sender];
        delete marriage[partner];
        writeJSON('marriage.json', marriage);
        await sock.sendMessage(from, { text: 'Perceraian berhasil' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal divorce' }, { quoted: msg });
      }
      return true;

    case 'achievement':
    case 'ach':
      try {
        const achievements = readJSON('achievements.json');
        const userAch = achievements[sender] || [];
        if (userAch.length === 0) {
          await sock.sendMessage(from, { text: 'Anda belum memiliki achievement' }, { quoted: msg });
          return true;
        }
        const achList = userAch.map((a, i) => `${i + 1}. ${a}`).join('\n');
        await sock.sendMessage(from, { text: `*Achievements:*\n${achList}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan achievement' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleFun };

