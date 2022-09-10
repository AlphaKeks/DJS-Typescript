import { ActivityType, Client } from 'discord.js'

export default {
	name: 'ready',

	execute(client: Client) {
		client.user!.setActivity('☕ ~Lofi Beats~', { type: ActivityType.Listening })

		console.log(`${client.user!.tag} is now online.`)
	}
}
