import { Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { getFiles } from '../functions';
require('dotenv').config();

export default (client: any) => {
	const commands: any[] = [];
	const commandList: any[] = [];
	const suffix = '.js';
	const commandFiles = getFiles(`${process.cwd()}/dist/commands`, suffix);
	client.commands = new Collection();

	for (const command of commandFiles) {
		let commandFile = require(command);
		if (commandFile.default) commandFile = commandFile.default;
		if (process.env.MODE !== 'PROD' && process.env.MODE !== 'DEV') return console.log('Invalid .env');

		commands.push(commandFile.data.toJSON());
		commandList.push(commandFile.data.name);
		client.commands.set(commandFile.data.name, commandFile);
	}

	client.once('ready', () => {
		const CLIENT_ID = client.user.id;
		const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN!);

		// Registering Commands
		(async () => {
			try {
				switch (process.env.MODE) {
					case 'DEV':
						await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.DEV_GUILD!), { body: commands });
						console.log('Sucessfully registered commands locally.');
						console.log(commandList);
						break;
					case 'PROD':
						await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
						console.log('Successfully registered commands globally.');
						console.log(commandList);
						break;
					default:
						return console.log('Failed to register commands.');
				}
			} catch (e) {
				console.error(e);
			}
		})();
	});

	client.on('interactionCreate', async (interaction: any) => {
		// Executing Commands
		if (interaction.isCommand() || interaction.isContextMenu()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.execute(interaction);
			} catch (e) {
				console.error(e);
			}
		}

		if (interaction.isSelectMenu()) {
			/*
      if (interaction.customId === "custom-id") {

      }
      */
		}
	});
};
