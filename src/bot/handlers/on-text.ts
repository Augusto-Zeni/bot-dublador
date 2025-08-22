import type { Context, NarrowedContext } from 'telegraf'
import type { Message, Update } from 'telegraf/typings/core/types/typegram.js'

export default function handleText(context: NarrowedContext<Context<Update>, {
  message: Update.New & Update.NonChannel & Message.TextMessage
  update_id: number
}>) {
  context.reply(`You said: ${context.message.text}`)
}
