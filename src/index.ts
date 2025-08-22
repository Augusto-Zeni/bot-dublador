import handleHelp from './bot/handlers/help'
import handleText from './bot/handlers/onText'
import handleVoice from './bot/handlers/onVoice'
import handleStart from './bot/handlers/start'
import bot from './bot/telegram'

bot.start(handleStart)
bot.help(handleHelp)
bot.on('text', handleText)
bot.on('voice', handleVoice)

bot.launch()
