import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'

export async function saveVoice(url: string, fileId: string): Promise<string> {
  try {
    const downloadDir = './downloads'
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true })
    }

    const filePath = path.join(downloadDir, `${fileId}.ogg`)

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

export async function cleanupFiles(filePaths: string[]) {
  for (const filePath of filePaths) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath)
        console.log(`Arquivo removido: ${filePath}`)
      }
      catch (error) {
        console.error(`Erro ao remover arquivo ${filePath}:`, error)
      }
    }
  }
}
