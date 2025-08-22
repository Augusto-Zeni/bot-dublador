import type { Context } from 'telegraf'
import type { Message, Update } from 'telegraf/typings/core/types/typegram.js'

export default function handleHelp(context: Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage
  update_id: number
}>) {
  context.reply('How can I assist you?')
}
