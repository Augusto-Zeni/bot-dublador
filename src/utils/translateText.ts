import { ai } from '../libs/gemini'

export async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${text} #### Act as a professional translator and translate the above text into ${to}. Keep the translation as close to the original as possible in tone and style.`,
    })

    return response.text || 'Empty translation'
  }
  catch (error) {
    console.error('### Error in translateText:', error)
    throw new Error(`Error in translateText: ${error}`)
  }
}
