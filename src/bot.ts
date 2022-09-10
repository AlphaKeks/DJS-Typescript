import { Bot } from './classes/Bot'
import 'dotenv/config'

const bot = new Bot({ intents: 131071 })
bot.run()
