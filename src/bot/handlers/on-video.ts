import type { Context, NarrowedContext } from 'telegraf'
import type { Message, Update } from 'telegraf/types'
import path from 'node:path'
import { cleanupFiles, extractAudio, mergeAudioVideo, saveFile } from '../../utils/file'
import { speachToText } from '../../utils/speachToText'
import { textToSpeach } from '../../utils/textToSpeach'
import { translateText } from '../../utils/translateText'

export default async function handleVideo(context: NarrowedContext<Context<Update>, {
  message: Update.New & Update.NonChannel & Message.VideoMessage
  update_id: number
}>) {
  let saveVideoDir = ''
  let saveAudioVideoDir = ''
  let textToSpeachPath = ''
  let dubVideoPath = ''

  try {
    if (!context.message?.video) {
      await context.reply('No voicemail found.')
      return
    }

    const fileId = context.message.video.file_id
    const mimeType = context.message.video.mime_type

    if (!mimeType) {
      await context.reply('Unidentified voice message MIME type.')
      return
    }

    const { href } = await context.telegram.getFileLink(fileId)

    saveVideoDir = await saveFile(href, fileId, mimeType)

    const dir = path.join(__dirname, `../../../downloads/${fileId}.mp3`)
    saveAudioVideoDir = await extractAudio(saveVideoDir, dir)

    const audioText = await speachToText(saveAudioVideoDir, 'audio/mp3')
    const translationText = await translateText(audioText, 'pt', 'english')

    textToSpeachPath = await textToSpeach(translationText, fileId)

    dubVideoPath = path.join(__dirname, `../../../files/${fileId}-dub.mp4`)
    await mergeAudioVideo(saveVideoDir, textToSpeachPath, dubVideoPath, {
      replaceAudio: true,
    })

    await context.replyWithVideo(
      { source: dubVideoPath },
      { reply_to_message_id: context.message.message_id } as any,
    )
  }
  catch (error: any) {
    console.error('### Error in handleVoice:', error)

    await cleanupFiles([saveVideoDir, saveAudioVideoDir, textToSpeachPath, dubVideoPath])

    await context.reply(`Failed to process voice message: ${error.message}`)
  }
  finally {
    await cleanupFiles([saveVideoDir, saveAudioVideoDir, textToSpeachPath, dubVideoPath])
  }
}
