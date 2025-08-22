import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createPartFromUri, createUserContent } from '@google/genai'
import axios from 'axios'
import { ai } from '../libs/gemini'

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

export async function speachToText(filePath: string, mimeType: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const stats = fs.statSync(filePath)
    if (stats.size === 0) {
      throw new Error('Saved file is empty!')
    }

    const myfile = await ai.files.upload({
      file: filePath,
      config: { mimeType },
    })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createUserContent([
        createPartFromUri(myfile.uri!, myfile.mimeType!),
        'You are a precise transcriber that outputs only the speech text, without timestamps or any extra metadata.',
      ]),
    })

    return response.text || 'Empty transcript'
  }
  catch (err: any) {
    console.error('### Gemini processing error:', err)
    throw new Error(`Error in transcription: ${err.message}`)
  }
}
