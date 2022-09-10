import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export default {
	data: new SlashCommandBuilder().setName('ping').setDescription('pong!'),

	execute(interaction: ChatInputCommandInteraction) {
		interaction.reply('pong!')
	}
}
