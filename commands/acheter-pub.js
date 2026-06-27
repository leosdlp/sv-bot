const { SlashCommandBuilder } = require('discord.js');
const { getUser, removeCoins, refundCoins } = require('../db');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('acheter-pub')
    .setDescription(`Achète le rôle Pub Communautaire pour ${config.PUB_PRICE} pièces`),

  async execute(interaction) {
    const { member, user, guild } = interaction;

    if (member.roles.cache.has(config.PUB_ROLE_ID)) {
      return interaction.reply({
        content: `Tu as déjà le rôle Pub Communautaire ! Poste ta pub dans <#${config.AD_CHANNEL_ID}>.`,
        ephemeral: true,
      });
    }

    const userData = getUser(user.id, guild.id);

    if (userData.balance < config.PUB_PRICE) {
      return interaction.reply({
        content: `Solde insuffisant (**${userData.balance} / ${config.PUB_PRICE}** pièces).`,
        ephemeral: true,
      });
    }

    removeCoins(user.id, guild.id, config.PUB_PRICE);

    try {
      await member.roles.add(config.PUB_ROLE_ID);
      await interaction.reply({
        content: `Rôle acheté pour **${config.PUB_PRICE} pièces** ! Poste ta pub dans <#${config.AD_CHANNEL_ID}>.\n⚠️ Le rôle sera retiré automatiquement dès ton message.`,
        ephemeral: true,
      });
    } catch (err) {
      refundCoins(user.id, guild.id, config.PUB_PRICE);
      console.error(`[ERREUR] Attribution du rôle pub à ${user.tag} :`, err);
      await interaction.reply({
        content: 'Une erreur est survenue lors de l\'attribution du rôle. Tes pièces ont été remboursées.',
        ephemeral: true,
      });
    }
  },
};
