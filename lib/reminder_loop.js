const { readJSON, writeJSON } = require('./functions');
const fs = require('fs');
const path = require('path');

let reminderInterval = null;
let sockInstance = null;

function startReminderLoop(sock) {
  sockInstance = sock;
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
  
  reminderInterval = setInterval(async () => {
    try {
      const reminders = readJSON('reminders.json');
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      for (const [id, reminder] of Object.entries(reminders)) {
        if (reminder.time === currentTime && !reminder.sent) {
          try {
            await sock.sendMessage(reminder.userId, { text: `⏰ *Reminder*\n\n${reminder.message}` });
            reminder.sent = true;
            reminder.sentAt = new Date().toISOString();
            reminders[id] = reminder;
            writeJSON('reminders.json', reminders);
          } catch (e) {
            console.error('Error sending reminder:', e.message);
          }
        }
      }
    } catch (e) {
      console.error('Error in reminder loop:', e.message);
    }
  }, 60000);
}

function stopReminderLoop() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}

module.exports = {
  startReminderLoop,
  stopReminderLoop
};

