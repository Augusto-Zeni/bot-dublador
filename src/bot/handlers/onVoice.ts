import type { Context, NarrowedContext } from 'telegraf'
import type { Message, Update } from 'telegraf/typings/core/types/typegram.js'
import { saveVoice } from '../../utils/file'

export default async function handleVoice(context: NarrowedContext<Context<Update>, {
  message: Update.New & Update.NonChannel & Message.VoiceMessage
  update_id: number
}>) {
  try {
    if (!context.message?.voice)
      return

    const fileId = context.message.voice.file_id
    const { href } = await context.telegram.getFileLink(fileId)

    await saveVoice(href, fileId)

    await context.reply('Voice message received and saved!')
  }
  catch {
    await context.reply('Failed to process the voice message.')
  }
}
