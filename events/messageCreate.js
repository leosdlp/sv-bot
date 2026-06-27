const { getUser, addCoins } = require('../db');
const config = require('../config.json');

// Verrou en mémoire pour éviter le double-traitement de pub simultané
const processing = new Set();

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const { channelId, member, author, content } = message;

    // --- Gain de pièces ---
    console.log(`[DEBUG] message de ${author.tag} dans ${channelId} | attendu: ${config.EARN_CHANNEL_ID} | contenu: "${content}" (${content.length} chars)`);
    if (channelId === config.EARN_CHANNEL_ID) {
      const roleOk = !config.RESTRICT_EARN_TO_INVITE_ROLE
        || member.roles.cache.has(config.INVITE_ROLE_ID);

      console.log(`[DEBUG] roleOk=${roleOk} | length=${content.length} >= ${config.MIN_MESSAGE_LENGTH}`);
      if (roleOk && content.length >= config.MIN_MESSAGE_LENGTH) {
        const now = Date.now();
        const user = getUser(author.id, message.guild.id);
        console.log(`[DEBUG] last_earn=${user.last_earn} | diff=${now - user.last_earn} | cooldown=${config.EARN_COOLDOWN_MS}`);

        if (now - user.last_earn >= config.EARN_COOLDOWN_MS) {
          addCoins(author.id, message.guild.id, config.COINS_PER_MESSAGE, now);
          console.log(`[DEBUG] +${config.COINS_PER_MESSAGE} pièces pour ${author.tag}`);
        } else {
          console.log(`[DEBUG] cooldown pas écoulé`);
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
