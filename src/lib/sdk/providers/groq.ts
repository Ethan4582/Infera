import type { LLMProvider, ChatMessage, ModelId } from '../types'

// We don't import Groq globally to prevent any static evaluation issues in Next.js builds
let client: any = null

async function getClient() {
  if (!client) {
    const { default: Groq } = await import('groq-sdk')
    client = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key_for_build' })
  }
  return client
}

export const groqProvider: LLMProvider = {
  id: 'groq',
  models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],

  async *chat(messages: ChatMessage[], model: ModelId) {
    const groqClient = await getClient()
    const stream = await groqClient.chat.completions.create({
      model,
      messages,
      stream: true,
    })
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? ''
      if (token) yield token
    }
  },
}