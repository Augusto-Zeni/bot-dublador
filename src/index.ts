import fs from 'node:fs'
import process from 'node:process'
import axios from 'axios'
import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN as string)

bot.start(context => context.reply('Welcome! I am your Telegram bot.'))

bot.help(context => context.reply('How can I assist you?'))

bot.on('text', context => context.reply(`You said: ${context.message.text}`))

bot.on('voice', async (context) => {
  try {
    console.log(context.message.voice.mime_type)

    const fileId = context.message.voice.file_id
    const { href: fileUrl } = await context.telegram.getFileLink(fileId)

    // Download the voice message
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    })

    // Save the voice message (voice messages are typically OGG)
    const filePath = `./downloads/${context.message.voice.file_id}.ogg`
    response.data.pipe(fs.createWriteStream(filePath))

    await context.reply('Voice message received and saved!')
  }
  catch (error) {
    console.error('Error handling voice message:', error)
    await context.reply('Failed to process the voice message.')
  }
})

bot.launch()
