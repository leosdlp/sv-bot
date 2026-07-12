const { getUser, addVoiceCoins } = require('../db');
const config = require('../config.json');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    // Ignorer les bots et les déconnexions/changements de salon sans rejoindre le cible
    if (newState.member.user.bot) return;
    if (newState.channelId !== config.VOICE_CHANNEL_ID) return;
    if (oldState.channelId === newState.channelId) return;

    const { id: userId } = newState.member.user;
    const { id: guildId } = newState.guild;
    const now = Date.now();
    const user = getUser(userId, guildId);

    if (now - user.last_voice >= config.VOICE_COOLDOWN_MS) {
      addVoiceCoins(userId, guildId, config.COINS_PER_VOICE, now);
      console.log(`[VOCAL] +${config.COINS_PER_VOICE} pièces pour ${newState.member.user.tag}`);
    }
  },
};
