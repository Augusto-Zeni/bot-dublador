import type { Context, NarrowedContext } from 'telegraf'
import type { Message, Update } from 'telegraf/types'
import path from 'node:path'
import { cleanupFiles, convertToOgg, saveFile } from '../../utils/file'
import { speachToText } from '../../utils/speachToText'
import { textToSpeach } from '../../utils/textToSpeach'
import { translateText } from '../../utils/translateText'

export default async function handleVoice(context: NarrowedContext<Context<Update>, {
  message: Update.New & Update.NonChannel & Message.VoiceMessage
  update_id: number
}>) {
  let saveVoiceDir = ''
  let wavFilePath = ''
  let oggPath = ''

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

    saveVoiceDir = await saveFile(href, fileId, mimeType)
    const audioText = await speachToText(saveVoiceDir, mimeType)
    const translationText = await translateText(audioText, 'pt', 'english')
    wavFilePath = await textToSpeach(translationText, fileId)

    oggPath = path.join(__dirname, `../../../files/${fileId}.ogg`)
    const oggBuffer = await convertToOgg(wavFilePath, oggPath)

    await context.replyWithVoice(
      { source: oggBuffer },
      { reply_to_message_id: context.message.message_id } as any,
    )

    // Limpar arquivos após sucesso
    await cleanupFiles([saveVoiceDir, wavFilePath])
  }
  catch (error: any) {
    console.error('### Error in handleVoice:', error)

    // Limpar arquivos mesmo em caso de erro
    await cleanupFiles([saveVoiceDir, wavFilePath, oggPath])

    await context.reply(`Failed to process voice message: ${error.message}`)
  }
}
