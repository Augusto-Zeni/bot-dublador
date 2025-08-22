/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
import dotenv from 'dotenv'
dotenv.config()

import handleHelp from './bot/handlers/help'
import handleText from './bot/handlers/on-text'
import handleVoice from './bot/handlers/on-voice'
import handleStart from './bot/handlers/start'
import bot from './bot/telegram'

bot.start(handleStart)
bot.help(handleHelp)
bot.on('text', handleText)
bot.on('voice', handleVoice)

bot.launch()
