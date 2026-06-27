require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter(f => f.endsWith('.js'))
  .map(f => require(`./commands/${f}`).data.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const { GUILD_ID } = require('./config.json');

(async () => {
  try {
    console.log(`Enregistrement de ${commands.length} commande(s)...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Commandes enregistrées avec succès.');
  } catch (err) {
    console.error(err);
  }
})();
