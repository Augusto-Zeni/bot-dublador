import type { Context, NarrowedContext } from 'telegraf'
import type { Message, Update } from 'telegraf/typings/core/types/typegram.js'
import { saveVoice } from '../../utils/file'
import { speachToText } from '../../utils/speachToText'
import { translateText } from '../../utils/translateText'

export default async function handleVoice(context: NarrowedContext<Context<Update>, {
  message: Update.New & Update.NonChannel & Message.VoiceMessage
  update_id: number
}>) {
  try {
    if (!context.message?.voice) {
      await context.reply('No voicemail found.')
      return
    }

    const fileId = context.message.voice.file_id
    const mimeType = context.message.voice.mime_type

    if (!mimeType) {
      await context.reply('Unidentified voice message MIME type.')
      return
    }

    const { href } = await context.telegram.getFileLink(fileId)

    const saveVoiceDir = await saveVoice(href, fileId)
    const audioText = await speachToText(saveVoiceDir, mimeType)
    const translationText = await translateText(audioText, 'pt', 'english')

    await context.reply(`Voice message processed successfully!\n\nTranscript: ${translationText}`)
  }
  catch (error: any) {
    console.error('### Error in handleVoice:', error)
    await context.reply(`Failed to process voice message: ${error.message}`)
  }
}
