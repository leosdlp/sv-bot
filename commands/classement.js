const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classement')
    .setDescription('Affiche le top 10 des membres les plus riches'),

  async execute(interaction) {
    const rows = getLeaderboard(interaction.guild.id);

    if (rows.length === 0) {
      return interaction.reply({
        content: 'Aucun membre n\'a encore gagné de pièces.',
        ephemeral: true,
      });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const lines = rows.map((row, i) => {
      const prefix = medals[i] ?? `**${i + 1}.**`;
      return `${prefix} <@${row.user_id}> — **${row.balance}** pièces`;
    });

    const embed = new EmbedBuilder()
      .setTitle('🏆 Classement des pièces')
      .setDescription(lines.join('\n'))
      .setColor(0xf1c40f);

    await interaction.reply({ embeds: [embed] });
  },
};
