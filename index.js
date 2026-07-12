require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { EARN_CHANNEL_ID } = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Chargement des commandes
client.commands = new Collection();
const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

// Chargement des événements
const eventFiles = fs
  .readdirSync(path.join(__dirname, 'events'))
  .filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Dispatcher des interactions slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.channelId !== EARN_CHANNEL_ID) {
    return interaction.reply({
      content: `Les commandes ne fonctionnent que dans <#${EARN_CHANNEL_ID}>.`,
      ephemeral: true,
    });
  }

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(`[ERREUR] Commande /${interaction.commandName} :`, err);
    const msg = { content: 'Une erreur est survenue.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
