import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'

export async function saveFile(url: string, fileId: string, mimeType: string): Promise<string> {
  try {
    const downloadDir = './downloads'

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true })
    }

    const extension = mimeType.split('/')[1]

    const filePath = path.join(downloadDir, `${fileId}.${extension}`)

    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    })

    await pipeline(
      response.data,
      fs.createWriteStream(filePath),
    )

    const stats = fs.statSync(filePath)

    if (stats.size === 0) {
      throw new Error('Saved file is empty!')
    }

    return filePath
  }
  catch (err: any) {
    console.error('### Error saving file:', err)
    throw new Error(`Error saving file: ${err.message}`)
  }
}

export async function convertToOgg(inputPath: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libopus')
      .format('ogg')
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', err => reject(err))
  })
}

export async function extractAudio(inputPath: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame') // codec de áudio (pode ser 'libopus' para ogg)
      .format('mp3')
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', err => reject(err))
  })
}

export async function mergeAudioVideo(
  videoPath: string,
  audioPath: string,
  outputPath: string,
  options: {
    replaceAudio?: boolean // se true, substitui o áudio original; se false, mixa
    audioVolume?: number // volume do áudio adicionado (0.0 a 1.0)
    videoVolume?: number // volume do áudio original do vídeo (0.0 a 1.0)
  } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      replaceAudio = true,
      audioVolume = 1.0,
      videoVolume = 0.5,
    } = options

    let command = ffmpeg()
      .input(videoPath)
      .input(audioPath)

    if (replaceAudio) {
      // Substitui o áudio original pelo novo áudio
      command = command
        .outputOptions([
          '-c:v copy', // copia o vídeo sem recodificar
          '-c:a aac', // codifica o áudio como AAC
          '-map 0:v:0', // mapeia o vídeo do primeiro input
          '-map 1:a:0', // mapeia o áudio do segundo input
          '-shortest', // termina quando o stream mais curto acabar
        ])
    }
    else {
      // Mixa o áudio original com o novo áudio
      command = command
        .complexFilter([
          `[0:a]volume=${videoVolume}[a0]`, // ajusta volume do áudio original
          `[1:a]volume=${audioVolume}[a1]`, // ajusta volume do áudio novo
          `[a0][a1]amix=inputs=2:duration=shortest[aout]`, // mixa os dois áudios
        ])
        .outputOptions([
          '-c:v copy', // copia o vídeo sem recodificar
          '-c:a aac', // codifica o áudio como AAC
          '-map 0:v:0', // mapeia o vídeo do primeiro input
          '-map [aout]', // mapeia o áudio mixado
        ])
    }

    command
      .format('mp4')
      .save(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine)
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent?.toFixed(2)}% complete`)
      })
      .on('end', () => {
        console.log('Merge completed successfully!')
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Merge error:', err.message)
        reject(err)
      })
  })
}

export async function cleanupFiles(filePaths: string[]) {
  for (const filePath of filePaths) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath)
      }
      catch (error) {
        console.error(`Erro ao remover arquivo ${filePath}:`, error)
      }
    }
  }
}
