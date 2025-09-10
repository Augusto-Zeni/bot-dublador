import { ai } from '../libs/gemini'

export async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text into ${to} without any additional text, introduction, or conclusion. The text is: "${text}"`,
    })

    return response.text || 'Empty translation'
  }
  catch (error) {
    console.error('### Error in translateText:', error)
    throw new Error(`Error in translateText: ${error}`)
  }
}
