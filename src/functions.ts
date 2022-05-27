import { CommandInteraction as Interaction, InteractionReplyOptions } from 'discord.js';
import fs from 'fs';

export const getFiles = (dir: string, suffix: string) => {
	const files = fs.readdirSync(dir, {
		withFileTypes: true,
	});

	let commandFiles: string[] = [];

	for (const file of files) {
		if (file.isDirectory()) {
			commandFiles = [...commandFiles, ...getFiles(`${dir}/${file.name}`, suffix)];
		} else if (file.name.endsWith(suffix)) {
			commandFiles.push(`${dir}/${file.name}`);
		}
	}

	return commandFiles;
};

export const answer = async (interaction: Interaction, input: InteractionReplyOptions) => {
	if (interaction.deferred === true) await interaction.editReply(input);
	else await interaction.reply(input);
};
