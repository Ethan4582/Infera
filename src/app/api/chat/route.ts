import { NextRequest } from 'next/server'
import { LLMClient } from '@/lib/sdk'
import { groqProvider } from '@/lib/sdk/providers/groq'
import type { ModelId } from '@/lib/sdk/types'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { messages, model, sessionId } = await req.json()

  if (!messages || !model || !sessionId) {
    return new Response('Missing required fields', { status: 400 })
  }

  // save user message
  await supabaseServer.from('messages').insert({
    session_id: sessionId,
    role: 'user',
    content: messages.at(-1)?.content,
  })

  const client = new LLMClient(groqProvider)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullOutput = ''
      try {
        for await (const token of client.chat(messages, model as ModelId, sessionId)) {
          fullOutput += token
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: token })}\n\n`))
        }
        // save assistant message
        await supabaseServer.from('messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: fullOutput,
        })
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (e: any) {
        const errorMsg = e.message || 'Error generating response'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`))
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