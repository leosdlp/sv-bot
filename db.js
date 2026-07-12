const Database = require('better-sqlite3');
const path = require('path');

const dataDir = process.env.DATA_DIR || __dirname;
const db = new Database(path.join(dataDir, 'economy.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id    TEXT NOT NULL,
    guild_id   TEXT NOT NULL,
    balance    INTEGER NOT NULL DEFAULT 0,
    last_earn  INTEGER NOT NULL DEFAULT 0,
    last_voice INTEGER NOT NULL DEFAULT 0,
    messages   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, guild_id)
  )
`);

// Migration pour les bases existantes
try {
  db.exec('ALTER TABLE users ADD COLUMN last_voice INTEGER NOT NULL DEFAULT 0');
} catch (_) {};

const stmts = {
  get: db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?'),
  upsert: db.prepare(`
    INSERT INTO users (user_id, guild_id, balance, last_earn, messages)
    VALUES (?, ?, 0, 0, 0)
    ON CONFLICT (user_id, guild_id) DO NOTHING
  `),
  addCoins: db.prepare('UPDATE users SET balance = balance + ?, messages = messages + 1, last_earn = ? WHERE user_id = ? AND guild_id = ?'),
  removeCoins: db.prepare('UPDATE users SET balance = balance - ? WHERE user_id = ? AND guild_id = ?'),
  refundCoins: db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ? AND guild_id = ?'),
  addVoiceCoins: db.prepare('UPDATE users SET balance = balance + ?, last_voice = ? WHERE user_id = ? AND guild_id = ?'),
  top10: db.prepare('SELECT user_id, balance, messages FROM users WHERE guild_id = ? ORDER BY balance DESC LIMIT 10'),
};

function getUser(userId, guildId) {
  stmts.upsert.run(userId, guildId);
  return stmts.get.get(userId, guildId);
}

function addCoins(userId, guildId, amount, now) {
  stmts.upsert.run(userId, guildId);
  stmts.addCoins.run(amount, now, userId, guildId);
}

function removeCoins(userId, guildId, amount) {
  stmts.removeCoins.run(amount, userId, guildId);
}

function refundCoins(userId, guildId, amount) {
  stmts.refundCoins.run(amount, userId, guildId);
}

function addVoiceCoins(userId, guildId, amount, now) {
  stmts.upsert.run(userId, guildId);
  stmts.addVoiceCoins.run(amount, now, userId, guildId);
}

function getLeaderboard(guildId) {
  return stmts.top10.all(guildId);
}

module.exports = { getUser, addCoins, removeCoins, refundCoins, addVoiceCoins, getLeaderboard };
