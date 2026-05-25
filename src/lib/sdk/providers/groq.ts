import Groq from 'groq-sdk'
import type { LLMProvider, ChatMessage, ModelId } from '../types'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const groqProvider: LLMProvider = {
  id: 'groq',
  models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],

  async *chat(messages: ChatMessage[], model: ModelId) {
    const stream = await client.chat.completions.create({
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