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
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-8 text-center">
          How can I help you?
        </h2>
        
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button 
            onClick={() => onSuggestion?.('Help me create a new Next.js web application')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/20 hover:bg-muted/50 border border-border/50 rounded-full transition-colors"
          >
            <span className="text-base leading-none">✨</span> Create
          </button>
          <button 
            onClick={() => onSuggestion?.('Explore the latest trends in artificial intelligence')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/20 hover:bg-muted/50 border border-border/50 rounded-full transition-colors"
          >
            <span className="text-base leading-none">📰</span> Explore
          </button>
          <button 
            onClick={() => onSuggestion?.('Write a Python script to scrape a website')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/20 hover:bg-muted/50 border border-border/50 rounded-full transition-colors"
          >
            <span className="text-base font-mono leading-none">{'<>'}</span> Code
          </button>
          <button 
            onClick={() => onSuggestion?.('Explain quantum computing in simple terms')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/20 hover:bg-muted/50 border border-border/50 rounded-full transition-colors"
          >
            <span className="text-base leading-none">🎓</span> Learn
          </button>
        </div>

        <div className="w-full max-w-2xl flex flex-col gap-1">
          {SUGGESTIONS.map((s, idx) => (
            <div key={s} className="w-full">
              <button
                onClick={() => onSuggestion?.(s)}
                className="w-full text-left px-4 py-4 text-sm text-foreground/80 hover:bg-muted/20 rounded-xl transition-colors"
              >
                {s}
              </button>
              {idx < SUGGESTIONS.length - 1 && (
                <div className="h-px w-[calc(100%-2rem)] mx-auto bg-border/40" />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
      <div className="max-w-4xl mx-auto space-y-1">
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
