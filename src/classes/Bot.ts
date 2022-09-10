import {
	ChatInputCommandInteraction,
	Client,
	ClientOptions,
	Collection,
	REST,
	RESTPostAPIApplicationCommandsJSONBody,
	Routes,
	SlashCommandBuilder
} from 'discord.js'
import { promises } from 'fs'

export class Bot extends Client {
	// you can load any sensitive credentials from your environment variables here
	private credentials = { discord: process.env.DJS_TOKEN }
	private mode = process.env.MODE
	private dev_guild = process.env.DEV_GUILD
	public commands: Collection<string, CommandData> = new Collection()

	constructor(options: ClientOptions) {
		super(options)
	}

	public async run(): Promise<void> {
		if (!this.credentials.discord)
			throw new Error('A `DJS_TOKEN` environment variable has to be defined.')

		await this.login(this.credentials.discord)
			.then(() => console.log('Bot has been started...'))
			.catch(console.error)

		this.eventHandler(`${process.cwd()}/dist/events/`)
		this.commandHandler(`${process.cwd()}/dist/commands/`, this.dev_guild)
	}

	private async eventHandler(dir: string): Promise<void> {
		const eventFiles = await promises.readdir(dir)
		const eventNames: string[] = []

		eventFiles.forEach(file => {
			const event = require(dir + file)?.default as EventData

			if (!event.name)
				throw new SyntaxError(`${file} must have a 'name' property of type 'string'.`)

			if (!event.execute) throw new SyntaxError(`${file} must have an 'execute' method.`)

			this.on(event.name, (...args) => event.execute(...args, this))
			eventNames.push(event.name)
		})

		console.log('[events]')
		console.log(`> ${eventNames.join('\n> ')}`)
	}

	private async commandHandler(dir: string, dev_guild?: string): Promise<void> {
		const commandFiles = await promises.readdir(dir)
		const commandNames: string[] = []
		const commandData: RESTPostAPIApplicationCommandsJSONBody[] = []

		commandFiles.forEach(file => {
			const command = require(dir + file)?.default as CommandData

			if (!command.data)
				throw new SyntaxError(
					`${file} must have a 'SlashCommandBuilder' exported as 'data' property.`
				)

			if (!command.execute) throw new SyntaxError(`${file} must have an 'execute' method.`)

			this.commands.set(command.data.name, command)
			commandData.push(command.data.toJSON())
			commandNames.push(command.data.name)
		})

		const restClient = new REST({ version: '10' }).setToken(this.credentials.discord!)

		switch (this.mode) {
			case 'DEV':
				if (!dev_guild)
					throw new Error('A `DEV_GUILD` environment variable has to be defined.')

				await restClient.put(Routes.applicationGuildCommands(this.user!.id, dev_guild), {
					body: commandData
				})
				break

			case 'PROD':
				await restClient.put(Routes.applicationCommands(this.user!.id), {
					body: commandData
				})
				break

			default:
				throw new Error('A `MODE` environment variable has to be defined.')
		}

		console.log(`[commands] - ${this.mode}`)
		console.log(`> ${commandNames.join('\n> ')}`)

		this.on('interactionCreate', async interaction => {
			if (interaction.isCommand()) {
				const command = this.commands.get(interaction.commandName)
				if (!command) return

				await command.execute(interaction as ChatInputCommandInteraction)
			}
		})
	}
}

interface EventData {
	name: string
	execute: Function
}

interface CommandData {
	data: SlashCommandBuilder
	execute: Function
}
