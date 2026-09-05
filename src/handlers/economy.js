const { readJSON, writeJSON, updateUserData, getUserData } = require('../../lib/functions');
const config = require('../../config');

async function handleEconomy(sock, msg, cmd, args, from, sender) {
  switch (cmd) {
    case 'balance':
    case 'saldo':
      try {
        const userData = getUserData(sender);
        const balance = userData?.balance || 0;
        await sock.sendMessage(from, { text: `Balance Anda: ${balance} koin` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan balance' }, { quoted: msg });
      }
      return true;

    case 'daily':
      try {
        const daily = readJSON('daily.json');
        const today = new Date().toDateString();
        if (daily[sender] === today) {
          await sock.sendMessage(from, { text: 'Anda sudah claim daily hari ini' }, { quoted: msg });
          return true;
        }
        const reward = Math.floor(Math.random() * 1000) + 500;
        updateUserData(sender, { balance: reward });
        daily[sender] = today;
        writeJSON('daily.json', daily);
        await sock.sendMessage(from, { text: `Daily reward: ${reward} koin` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal claim daily' }, { quoted: msg });
      }
      return true;

    case 'transfer':
      try {
        const target = args[0]?.replace('@', '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        const amount = parseInt(args[1]);
        if (!target || !amount || amount <= 0) {
          await sock.sendMessage(from, { text: 'Format: !transfer [@user] [jumlah]' }, { quoted: msg });
          return true;
        }
        const userData = getUserData(sender);
        if (!userData || (userData.balance || 0) < amount) {
          await sock.sendMessage(from, { text: 'Balance tidak cukup' }, { quoted: msg });
          return true;
        }
        updateUserData(sender, { balance: -amount });
        updateUserData(target, { balance: amount });
        await sock.sendMessage(from, { text: `Berhasil transfer ${amount} koin ke ${target}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal transfer' }, { quoted: msg });
      }
      return true;

    case 'shop':
      try {
        const shop = readJSON('shop.json');
        const items = Object.keys(shop).map(key => `- ${key}: ${shop[key].price} koin`).join('\n');
        await sock.sendMessage(from, { text: `*Shop:*\n${items || 'Tidak ada item'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan shop' }, { quoted: msg });
      }
      return true;

    case 'buy':
      try {
        const itemName = args[0];
        if (!itemName) {
          await sock.sendMessage(from, { text: 'Format: !buy [item]' }, { quoted: msg });
          return true;
        }
        const shop = readJSON('shop.json');
        const item = shop[itemName];
        if (!item) {
          await sock.sendMessage(from, { text: 'Item tidak ditemukan' }, { quoted: msg });
          return true;
        }
        const userData = getUserData(sender);
        if (!userData || (userData.balance || 0) < item.price) {
          await sock.sendMessage(from, { text: 'Balance tidak cukup' }, { quoted: msg });
          return true;
        }
        updateUserData(sender, { balance: -item.price });
        const inventory = readJSON('inventory.json');
        if (!inventory[sender]) inventory[sender] = {};
        if (!inventory[sender][itemName]) inventory[sender][itemName] = 0;
        inventory[sender][itemName]++;
        writeJSON('inventory.json', inventory);
        await sock.sendMessage(from, { text: `Berhasil membeli ${itemName}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal membeli item' }, { quoted: msg });
      }
      return true;

    case 'inventory':
    case 'inv':
      try {
        const inventory = readJSON('inventory.json');
        const userInv = inventory[sender] || {};
        const items = Object.keys(userInv).map(key => `- ${key}: ${userInv[key]}`).join('\n');
        await sock.sendMessage(from, { text: `*Inventory:*\n${items || 'Tidak ada item'}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan inventory' }, { quoted: msg });
      }
      return true;

    case 'lottery':
      try {
        const amount = parseInt(args[0]) || 100;
        const userData = getUserData(sender);
        if (!userData || (userData.balance || 0) < amount) {
          await sock.sendMessage(from, { text: 'Balance tidak cukup' }, { quoted: msg });
          return true;
        }
        updateUserData(sender, { balance: -amount });
        const win = Math.random() < 0.3;
        if (win) {
          const prize = amount * 2;
          updateUserData(sender, { balance: prize });
          await sock.sendMessage(from, { text: `Selamat! Anda menang ${prize} koin` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: 'Anda kalah, coba lagi!' }, { quoted: msg });
        }
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal lottery' }, { quoted: msg });
      }
      return true;

    case 'bank':
      try {
        const bank = readJSON('bank.json');
        const userBank = bank[sender] || { balance: 0 };
        await sock.sendMessage(from, { text: `Bank Balance: ${userBank.balance} koin` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan bank' }, { quoted: msg });
      }
      return true;

    case 'deposit':
      try {
        const amount = parseInt(args[0]);
        if (!amount || amount <= 0) {
          await sock.sendMessage(from, { text: 'Format: !deposit [jumlah]' }, { quoted: msg });
          return true;
        }
        const userData = getUserData(sender);
        if (!userData || (userData.balance || 0) < amount) {
          await sock.sendMessage(from, { text: 'Balance tidak cukup' }, { quoted: msg });
          return true;
        }
        updateUserData(sender, { balance: -amount });
        const bank = readJSON('bank.json');
        if (!bank[sender]) bank[sender] = { balance: 0 };
        bank[sender].balance += amount;
        writeJSON('bank.json', bank);
        await sock.sendMessage(from, { text: `Berhasil deposit ${amount} koin` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal deposit' }, { quoted: msg });
      }
      return true;

    case 'withdraw':
      try {
        const amount = parseInt(args[0]);
        if (!amount || amount <= 0) {
          await sock.sendMessage(from, { text: 'Format: !withdraw [jumlah]' }, { quoted: msg });
          return true;
        }
        const bank = readJSON('bank.json');
        if (!bank[sender] || (bank[sender].balance || 0) < amount) {
          await sock.sendMessage(from, { text: 'Bank balance tidak cukup' }, { quoted: msg });
          return true;
        }
        bank[sender].balance -= amount;
        writeJSON('bank.json', bank);
        updateUserData(sender, { balance: amount });
        await sock.sendMessage(from, { text: `Berhasil withdraw ${amount} koin` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal withdraw' }, { quoted: msg });
      }
      return true;

    case 'leaderboard':
    case 'lb':
      try {
        const users = readJSON('users.json');
        const sorted = Object.values(users).sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 10);
        const lb = sorted.map((u, i) => `${i + 1}. ${u.name}: ${u.balance || 0} koin`).join('\n');
        await sock.sendMessage(from, { text: `*Leaderboard:*\n${lb}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan leaderboard' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleEconomy };

