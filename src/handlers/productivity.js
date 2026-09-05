const { readJSON, writeJSON, getUserId } = require('../../lib/functions');

async function handleProductivity(sock, msg, cmd, args, from, sender) {
  switch (cmd) {
    case 'addtask':
      try {
        const taskContent = args.join(' ');
        if (!taskContent) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.addtask Beli susu\n.addtask Meeting jam 3\n\n📝 *Contoh:*\n.addtask Beli susu\n.addtask Meeting jam 3 sore' }, { quoted: msg });
          return true;
        }
        const tasks = readJSON('tasks.json');
        if (!tasks[sender]) tasks[sender] = [];
        const taskId = Date.now().toString();
        tasks[sender].push({
          id: taskId,
          content: taskContent,
          done: false,
          createdAt: new Date().toISOString()
        });
        writeJSON('tasks.json', tasks);
        await sock.sendMessage(from, { text: `✅ Task berhasil ditambahkan\nID: ${taskId}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menambah task' }, { quoted: msg });
      }
      return true;

    case 'listtask':
      try {
        const tasks = readJSON('tasks.json');
        const userTasks = tasks[sender] || [];
        if (userTasks.length === 0) {
          await sock.sendMessage(from, { text: '📋 *To-Do List:*\n\nTidak ada task' }, { quoted: msg });
          return true;
        }
        const taskList = userTasks.map((task, index) => {
          const status = task.done ? '✅' : '⏳';
          return `${index + 1}. ${status} [${task.id}] ${task.content}`;
        }).join('\n');
        await sock.sendMessage(from, { text: `📋 *To-Do List:*\n\n${taskList}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal mendapatkan task list' }, { quoted: msg });
      }
      return true;

    case 'deletetask':
      try {
        const taskId = args[0];
        if (!taskId) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.deletetask [id]\n\n📝 *Contoh:*\n.deletetask 1234567890' }, { quoted: msg });
          return true;
        }
        const tasks = readJSON('tasks.json');
        if (!tasks[sender]) {
          await sock.sendMessage(from, { text: 'Tidak ada task' }, { quoted: msg });
          return true;
        }
        const taskIndex = tasks[sender].findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
          await sock.sendMessage(from, { text: 'Task tidak ditemukan' }, { quoted: msg });
          return true;
        }
        tasks[sender].splice(taskIndex, 1);
        writeJSON('tasks.json', tasks);
        await sock.sendMessage(from, { text: 'Task berhasil dihapus' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal menghapus task' }, { quoted: msg });
      }
      return true;

    case 'donetask':
      try {
        const taskId = args[0];
        if (!taskId) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.donetask [id]\n\n📝 *Contoh:*\n.donetask 1234567890' }, { quoted: msg });
          return true;
        }
        const tasks = readJSON('tasks.json');
        if (!tasks[sender]) {
          await sock.sendMessage(from, { text: 'Tidak ada task' }, { quoted: msg });
          return true;
        }
        const task = tasks[sender].find(t => t.id === taskId);
        if (!task) {
          await sock.sendMessage(from, { text: 'Task tidak ditemukan' }, { quoted: msg });
          return true;
        }
        task.done = true;
        task.completedAt = new Date().toISOString();
        writeJSON('tasks.json', tasks);
        await sock.sendMessage(from, { text: '✅ Task selesai!' }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal update task' }, { quoted: msg });
      }
      return true;

    case 'remind':
      try {
        const time = args[0];
        const message = args.slice(1).join(' ');
        if (!time || !message) {
          await sock.sendMessage(from, { text: '❌ *Format Salah!*\n\n✅ *Format Benar:*\n.remind 10:00 Meeting penting\n.remind 15:30 Beli susu\n\n📝 *Contoh:*\n.remind 10:00 Meeting penting\n.remind 15:30 Beli susu' }, { quoted: msg });
          return true;
        }
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
          await sock.sendMessage(from, { text: 'Format waktu salah! Gunakan format HH:MM (contoh: 10:00)' }, { quoted: msg });
          return true;
        }
        const reminders = readJSON('reminders.json');
        const reminderId = Date.now().toString();
        reminders[reminderId] = {
          userId: from,
          time: time,
          message: message,
          sent: false,
          createdAt: new Date().toISOString()
        };
        writeJSON('reminders.json', reminders);
        await sock.sendMessage(from, { text: `⏰ Reminder berhasil dibuat\nWaktu: ${time}\nPesan: ${message}` }, { quoted: msg });
      } catch (e) {
        await sock.sendMessage(from, { text: 'Gagal membuat reminder' }, { quoted: msg });
      }
      return true;

    default:
      return false;
  }
}

module.exports = { handleProductivity };

