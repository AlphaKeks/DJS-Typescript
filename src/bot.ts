import { Client } from 'discord.js';
import commandHandler from './handlers/commandHandler';
import eventHandler from './handlers/eventHandler';
require('dotenv').config();

const Bot = new Client({ intents: 131071 });

commandHandler(Bot);
eventHandler(Bot);

Bot.login(process.env.BOT_TOKEN).then(() => {
	console.log('Dawn is up and running!');
});
