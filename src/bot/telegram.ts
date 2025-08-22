import process from 'node:process'
import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN as string)
export default bot
