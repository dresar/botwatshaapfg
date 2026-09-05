const { readJSON, writeJSON, updateUserData, getUserData } = require('../../lib/functions');
const config = require('../../config');

async function handleGames(sock, msg, cmd, args, from, sender) {
  switch (cmd) {
    case 'tebakangka':
      try {
        const games = readJSON('games.json');
        if (!games[sender]) games[sender] = {};
        if (!games[sender].tebakangka) {
          const number = Math.floor(Math.random() * 100) + 1;
          games[sender].tebakangka = number;
          writeJSON('games.json', games);
          await sock.sendMessage(from, { text: 'Tebak angka 1-100!' }, { quoted: msg });
          return true;
        }
        const guess = parseInt(args[0]);
        if (!guess) {
          await sock.sendMessage(from, { text: 'Format: !tebakangka [angka]' }, { quoted: msg });
          return true;
        }
        const answer = games[sender].tebakangka;
        if (guess === answer) {
          delete games[sender].tebakangka;
          writeJSON('games.json', games);
          const reward = Math.floor(Math.random() * 500) + 200;
          updateUserData(sender, { balance: reward });
          await sock.sendMessage(from, { text: `Benar! Anda mendapat ${reward} koin` }, { quoted: msg });
        } else if (guess < answer) {
          await sock.sendMessage(from, { text: 'Terlalu kecil!' }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Terlalu besar!' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal tebak angka' }, { quoted: msg });
      }
      return true;

    case 'suit':
      try {
        const choices = ['batu', 'kertas', 'gunting'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        const userChoice = args[0]?.toLowerCase();
        if (!userChoice || !choices.includes(userChoice)) {
          await sock.sendMessage(from, { text: 'Format: !suit [batu/kertas/gunting]' }, { quoted: msg });
          return true;
        }
        let result = '';
        if (userChoice === botChoice) {
          result = 'Seri!';
        } else if (
          (userChoice === 'batu' && botChoice === 'gunting') ||
          (userChoice === 'kertas' && botChoice === 'batu') ||
          (userChoice === 'gunting' && botChoice === 'kertas')
        ) {
          result = 'Anda menang!';
          updateUserData(sender, { balance: 50 });
        } else {
          result = 'Anda kalah!';
        }
        await sock.sendMessage(from, { text: `Bot: ${botChoice}\nAnda: ${userChoice}\n${result}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal suit' }, { quoted: msg });
      }
      return true;

    case 'math':
      try {
        const games = readJSON('games.json');
        if (!games[sender]) games[sender] = {};
        const num1 = Math.floor(Math.random() * 50) + 1;
        const num2 = Math.floor(Math.random() * 50) + 1;
        const answer = num1 + num2;
        games[sender].math = answer;
        writeJSON('games.json', games);
        await sock.sendMessage(from, { text: `Berapa hasil dari ${num1} + ${num2}?` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal math' }, { quoted: msg });
      }
      return true;

    case 'jawab':
      try {
        const games = readJSON('games.json');
        if (!games[sender] || !games[sender].math) {
          await sock.sendMessage(from, { text: 'Tidak ada pertanyaan math aktif' }, { quoted: msg });
          return true;
        }
        const answer = parseInt(args[0]);
        if (!answer) {
          await sock.sendMessage(from, { text: 'Format: !jawab [angka]' }, { quoted: msg });
          return true;
        }
        const correct = games[sender].math;
        if (answer === correct) {
          delete games[sender].math;
          writeJSON('games.json', games);
          const reward = Math.floor(Math.random() * 100) + 50;
          updateUserData(sender, { balance: reward });
          await sock.sendMessage(from, { text: `Benar! Anda mendapat ${reward} koin` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: `Salah! Jawaban yang benar: ${correct}` }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal jawab' }, { quoted: msg });
      }
      return true;

    case 'trivia':
      try {
        const trivia = readJSON('trivia.json');
        const questions = Object.keys(trivia);
        if (questions.length === 0) {
          await sock.sendMessage(from, { text: 'Tidak ada trivia tersedia' }, { quoted: msg });
          return true;
        }
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        const games = readJSON('games.json');
        if (!games[sender]) games[sender] = {};
        games[sender].trivia = { question: randomQ, answer: trivia[randomQ] };
        writeJSON('games.json', games);
        await sock.sendMessage(from, { text: `Trivia: ${randomQ}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal trivia' }, { quoted: msg });
      }
      return true;

    case 'jawabtrivia':
      try {
        const games = readJSON('games.json');
        if (!games[sender] || !games[sender].trivia) {
          await sock.sendMessage(from, { text: 'Tidak ada trivia aktif' }, { quoted: msg });
          return true;
        }
        const answer = args.join(' ').toLowerCase();
        const correct = games[sender].trivia.answer.toLowerCase();
        if (answer === correct) {
          delete games[sender].trivia;
          writeJSON('games.json', games);
          const reward = Math.floor(Math.random() * 200) + 100;
          updateUserData(sender, { balance: reward });
          await sock.sendMessage(from, { text: `Benar! Anda mendapat ${reward} koin` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: `Salah! Jawaban yang benar: ${games[sender].trivia.answer}` }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal jawab trivia' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleGames };

