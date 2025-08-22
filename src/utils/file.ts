import fs from 'node:fs'
import axios from 'axios'

export async function saveVoice(url: string, fileId: string): Promise<void> {
  const response = await axios({
    method: 'get',
    url,
    responseType: 'stream',
  })

  const filePath = `./downloads/${fileId}.ogg`
  response.data.pipe(fs.createWriteStream(filePath))
}
