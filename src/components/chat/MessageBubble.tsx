'use client'

import { useState } from 'react'
import type { ChatMessage, ModelId } from '@/lib/sdk/types'
import { Copy, Check, RefreshCcw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { PROVIDERS } from '@/constants/models'

interface Props {
  message: ChatMessage
  isStreaming?: boolean
  model?: string
}

const formatText = (text: string) => {
  if (!text) return null
  return text.split('\n\n').map((paragraph, i) => {
    const parts = paragraph.split(/(\*\*.*?\*\*)/g)
    return (
      <p key={i} className="mb-3 last:mb-0">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
          }
          return part.split('\n').map((line, k, arr) => (
            <span key={`${j}-${k}`}>
              {line}
              {k < arr.length - 1 && <br />}
            </span>
          ))
        })}
      </p>
    )
  })
}

export default function MessageBubble({ message, isStreaming, model, onRetry }: Props & { onRetry?: (model: ModelId) => void }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-5`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium text-muted-foreground/80">
          {isUser ? 'You' : 'Assistant'}
        </span>
      </div>
      <div
        className={`max-w-[90%] md:max-w-[80%] text-sm leading-relaxed ${
          isUser
            ? 'rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-3 shadow-sm whitespace-pre-wrap'
            : 'text-foreground/90'
        }`}
      >
        {isUser ? message.content : formatText(message.content)}
        {isStreaming && <span className="animate-pulse ml-0.5 inline-block text-primary">▋</span>}
      </div>
      
      {!isUser && !isStreaming && (
        <div className="flex items-center gap-2 mt-2">
          {model && (
            <span className="text-[10px] text-muted-foreground/50 mr-2">{model}</span>
          )}
          <button 
            onClick={handleCopy} 
            title="Copy response"
            className="flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted rounded-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onRetry && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  title="Try again"
                  className="flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted rounded-md transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground/80">Try again with:</div>
                {PROVIDERS.flatMap(p => 
                  p.models.map(m => (
                    <DropdownMenuItem 
                      key={m.id} 
                      onClick={() => onRetry(m.id as ModelId)}
                      className="text-xs"
                    >
                      {m.label}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  )
}
