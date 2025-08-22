import type { Context } from 'telegraf'
import type { Message, Update } from 'telegraf/typings/core/types/typegram.js'

export default function handleStart(context: Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage
  update_id: number
}>) {
  context.reply('Welcome! I am your Telegram bot.')
}
