'use client'

import { useRef, useEffect } from 'react'
import type { ChatMessage } from '@/lib/sdk/types'
import MessageBubble from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  isStreaming: boolean
  model?: string
  onSuggestion?: (text: string) => void
  isLoading?: boolean
  onRetry?: (model: import('@/lib/sdk/types').ModelId) => void
}

const SUGGESTIONS = [
  'How does AI work?',
  'Explain quantum computing',
  'What is the meaning of life?',
  'Write a haiku about coding',
]

export default function ChatWindow({ messages, isStreaming, model, onSuggestion, isLoading, onRetry }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col items-end">
            <div className="h-12 w-48 bg-card border border-border animate-pulse rounded-2xl rounded-br-sm" />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-24 w-3/4 bg-card border border-border animate-pulse rounded-2xl rounded-bl-sm" />
          </div>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-8">
          How can I help you?
        </h2>
        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => onSuggestion?.(s)}
              className="px-4 py-2.5 text-sm text-muted-foreground border border-border rounded-xl hover:bg-card hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-1">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
            model={msg.role === 'assistant' ? model : undefined}
            onRetry={onRetry}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
