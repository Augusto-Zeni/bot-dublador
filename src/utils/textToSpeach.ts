import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import wav from 'wav'
import { ai } from '../libs/gemini'

async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  dir: string,
  channels = 1,
  rate = 24000,
  sampleWidth = 2,
) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const filePath = path.join(dir, filename)

    const writer = new wav.FileWriter(filePath, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    })

    writer.on('finish', resolve)
    writer.on('error', reject)

    writer.write(pcmData)
    writer.end()
  })
}

export async function textToSpeach(text: string, fileName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Gacrux' },
          },
        },
      },
    })

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

    if (!data) {
      throw new Error('Dados de áudio não encontrados na resposta da IA.')
    }
    const dir = path.join(__dirname, '../../files')

    const audioBuffer = Buffer.from(data, 'base64')
    await saveWaveFile(`${fileName}.wav`, audioBuffer, dir)

    return `${dir}/${fileName}.wav`
  }
  catch (error) {
    console.error('### Erro em textToSpeach:', error)
    throw new Error(`Error in textToSpeach: ${error}`)
  }
}
