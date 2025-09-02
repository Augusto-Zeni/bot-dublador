import type { Context, NarrowedContext } from 'telegraf'
import type { Message, Update } from 'telegraf/typings/core/types/typegram.js'
import { translateText } from '../../utils/translateText'

export default async function handleText(context: NarrowedContext<Context<Update>, {
  message: Update.New & Update.NonChannel & Message.TextMessage
  update_id: number
}>) {
  const translation = await translateText(context.message.text, 'pt', 'english')

  context.reply(`You said: ${context.message.text}\n\nTranslation: ${translation}`)
}
