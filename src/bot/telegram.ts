import process from 'node:process'
import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN as string)
export default bot
