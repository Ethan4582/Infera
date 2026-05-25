import { NextRequest } from 'next/server'
import { LLMClient } from '@/lib/sdk'
import { groqProvider } from '@/lib/sdk/providers/groq'
import type { ModelId } from '@/lib/sdk/types'

export async function POST(req: NextRequest) {
  const { messages, model, sessionId } = await req.json()

  if (!messages || !model || !sessionId) {
    return new Response('Missing required fields', { status: 400 })
  }

  const client = new LLMClient(groqProvider)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const token of client.chat(messages, model as ModelId, sessionId)) {
          controller.enqueue(encoder.encode(`data: ${token}\n\n`))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}