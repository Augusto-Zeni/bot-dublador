import process from 'node:process'
import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN as string)

bot.start(ctx => ctx.reply('Welcome! I am your Telegram bot.'))
bot.help(ctx => ctx.reply('How can I assist you?'))
bot.on('text', ctx => ctx.reply(`You said: ${ctx.message.text}`))

bot.launch()
