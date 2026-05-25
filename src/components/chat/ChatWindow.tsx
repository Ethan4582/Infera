'use client'

import { useRef, useEffect } from 'react'
import type { ChatMessage } from '@/lib/sdk/types'
import MessageBubble from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  isStreaming: boolean
}

export default function ChatWindow({ messages, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-80">💬</div>
          <p className="text-lg font-medium text-foreground">Start a conversation</p>
          <p className="text-sm mt-1">Select a model and type your message below</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:px-6 space-y-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
