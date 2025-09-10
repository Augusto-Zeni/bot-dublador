import type { Context, NarrowedContext } from 'telegraf'
import type { Message, Update } from 'telegraf/types'
import { convertToOgg, saveVoice } from '../../utils/file'
import { speachToText } from '../../utils/speachToText'
import { textToSpeach } from '../../utils/textToSpeach'
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
    const audioBuffer = await textToSpeach(translationText, fileId)

    const oggPath = `/Users/augustozeni/Documents/bot-dublador/files/${fileId}.ogg`
    const oggBuffer = await convertToOgg(audioBuffer, oggPath)

    await context.replyWithVoice(
      { source: oggBuffer },
      { reply_to_message_id: context.message.message_id } as any,
    )
  }
  catch (error: any) {
    console.error('### Error in handleVoice:', error)
    await context.reply(`Failed to process voice message: ${error.message}`)
  }
}
