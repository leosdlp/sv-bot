const { SlashCommandBuilder } = require('discord.js');
const { getUser, getLeaderboard } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('solde')
    .setDescription('Affiche tes pièces (et optionnellement ton rang)')
    .addUserOption(opt =>
      opt.setName('membre')
        .setDescription('(Admin) Consulter le solde d\'un autre membre')
        .setRequired(false)
    ),

  async execute(interaction) {
    const isAdmin = interaction.member.permissions.has('Administrator');
    const target = interaction.options.getUser('membre');

    if (target && !isAdmin) {
      return interaction.reply({
        content: 'Tu n\'as pas la permission de consulter le solde d\'un autre membre.',
        ephemeral: true,
      });
    }

    const subject = target ?? interaction.user;
    const user = getUser(subject.id, interaction.guild.id);

    // Calcul du rang
    const board = getLeaderboard(interaction.guild.id);
    const rank = board.findIndex(r => r.user_id === subject.id) + 1;
    const rankStr = rank > 0 ? ` · Rang #${rank}` : '';

    const label = target ? `<@${target.id}>` : 'Tu';
    await interaction.reply({
      content: `${label} as **${user.balance} pièce${user.balance !== 1 ? 's' : ''}**${rankStr}.`,
      ephemeral: true,
    });
  },
};
