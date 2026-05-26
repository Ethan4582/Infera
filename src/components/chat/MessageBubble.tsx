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

const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Extremely basic syntax highlighting for JS/TS to satisfy the request without heavy deps
  const highlightCode = (str: string) => {
    if (!['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(language?.toLowerCase())) {
      return str
    }
    const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|extends|interface|type|async|await)\b/g
    const strings = /(['"\`].*?['"\`])/g
    const comments = /(\/\/.*$)/gm
    
    let highlighted = str
      .replace(strings, '<span style="color: #a6e3a1">$&</span>')
      .replace(keywords, '<span style="color: #cba6f7">$&</span>')
      .replace(comments, '<span style="color: #6c7086; font-style: italic">$&</span>')
      
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
  }

  return (
    <div className="my-4 rounded-xl overflow-hidden bg-[#1e1e2e] border border-border/50 shadow-sm font-sans w-full max-w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-border/50">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{language || 'text'}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1.5 transition-colors">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13px] font-mono text-[#cdd6f4] leading-relaxed">
        <pre className="whitespace-pre"><code>{language ? highlightCode(code) : code}</code></pre>
      </div>
    </div>
  )
}

const formatMarkdown = (text: string, baseIndex: number) => {
  return text.split('\n\n').map((paragraph, i) => {
    if (!paragraph.trim()) return null
    const lines = paragraph.split('\n')
    const isList = lines.length > 0 && lines.every(line => /^(\s*[-*]\s+|\s*\d+\.\s+)/.test(line))
    
    if (isList) {
      return (
        <ul key={`${baseIndex}-${i}`} className="mb-5 last:mb-0 space-y-2 ml-4">
          {lines.map((line, j) => {
            const match = line.match(/^(\s*[-*]\s+|\s*\d+\.\s+)(.*)/)
            if (!match) return null
            const bullet = match[1]
            const content = match[2]
            const isNumbered = /\d/.test(bullet)
            
            const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g)
            const formattedContent = parts.map((part, k) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={k} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={k} className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-[13px]">{part.slice(1, -1)}</code>
              }
              return part
            })

            return (
              <li key={j} className={`relative pl-2 ${isNumbered ? 'list-decimal ml-2' : 'list-none'}`}>
                {!isNumbered && (
                  <span className="absolute left-[-1.25rem] top-[0.55rem] w-1.5 h-1.5 rounded-full bg-pink-500/80" />
                )}
                <span className="text-foreground/90">{formattedContent}</span>
              </li>
            )
          })}
        </ul>
      )
    }

    const parts = paragraph.split(/(\*\*.*?\*\*|`.*?`)/g)
    return (
      <p key={`${baseIndex}-${i}`} className="mb-5 last:mb-0 leading-relaxed text-foreground/90">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={j} className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-[13px]">{part.slice(1, -1)}</code>
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

const formatText = (text: string) => {
  if (!text) return null
  
  // Match code blocks ```lang ... ```
  const parts = text.split(/(```\w*\n[\s\S]*?```)/g)
  
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/)
      if (match) {
        return <CodeBlock key={index} language={match[1]} code={match[2]} />
      }
    }
    return formatMarkdown(part, index)
  }).filter(Boolean)
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
