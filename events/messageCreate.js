const { getUser, addCoins } = require('../db');
const config = require('../config.json');

const processing = new Set();

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const { channelId, member, author, content } = message;

    // --- Gain de pièces (messages) ---
    if (channelId === config.EARN_CHANNEL_ID) {
      const roleOk = !config.RESTRICT_EARN_TO_INVITE_ROLE
        || member.roles.cache.has(config.INVITE_ROLE_ID);

      if (roleOk && content.length >= config.MIN_MESSAGE_LENGTH) {
        const now = Date.now();
        const user = getUser(author.id, message.guild.id);

        if (now - user.last_earn >= config.EARN_COOLDOWN_MS) {
          addCoins(author.id, message.guild.id, config.COINS_PER_MESSAGE, now);
        }
      }
    }

    // --- Détection pub + retrait du rôle ---
    if (channelId === config.AD_CHANNEL_ID) {
      if (!member.roles.cache.has(config.PUB_ROLE_ID)) return;
      if (processing.has(author.id)) return;

      processing.add(author.id);
      try {
        await member.roles.remove(config.PUB_ROLE_ID);
        await message.react('✅');
      } catch (err) {
        console.error(`[ERREUR] Retrait du rôle pub pour ${author.tag} :`, err);
      } finally {
        processing.delete(author.id);
      }
    }
  },
};
