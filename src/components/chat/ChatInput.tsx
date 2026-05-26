'use client'

import { useState, useRef, useEffect } from 'react'
import type { ModelId } from '@/lib/sdk/types'
import { PROVIDERS } from '@/constants/models'
import { Loader2, ArrowUp } from 'lucide-react'

interface Props {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
  model: ModelId
  setModel: (m: ModelId) => void
}

import { Zap, Search, Paperclip } from 'lucide-react'

export default function ChatInput({ onSend, onStop, isStreaming, model, setModel }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus()
  }, [isStreaming])

  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    adjustHeight()
  }

  const handleSubmit = () => {
    if (!value.trim() || isStreaming) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="px-4 pb-6 md:px-6 pt-2">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md shadow-sm focus-within:ring-1 focus-within:ring-ring/30 focus-within:bg-card/60 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={1}
            disabled={isStreaming}
            className="w-full resize-none bg-transparent border-none px-5 pt-5 pb-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50 min-h-[52px] max-h-[160px]"
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-2">
              <select
                value={model || 'llama-3.3-70b-versatile'}
                onChange={e => setModel(e.target.value as ModelId)}
                disabled={isStreaming}
                className="rounded-lg bg-transparent text-muted-foreground/70 border-none px-2 py-1.5 text-xs font-medium focus:outline-none hover:text-foreground hover:bg-muted/30 cursor-pointer transition-colors"
              >
                {PROVIDERS.flatMap(p =>
                  p.models.map(m => (
                    <option key={m.id} value={m.id} className="bg-card text-foreground">
                      {m.label}
                    </option>
                  ))
                )}
              </select>

  

              
            </div>

            <div className="flex items-center gap-3">
              {value.length > 0 && (
                <span className="text-[10px] text-muted-foreground/40">{value.length}</span>
              )}
              {isStreaming ? (
                <button
                  onClick={onStop}
                  className="w-8 h-8 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Loader2 className="w-4 h-4 text-destructive-foreground animate-spin" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!value.trim()}
                  className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm"
                >
                  <ArrowUp className="w-4 h-4 text-primary-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
