'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
}

export default function ChatInput({ onSend, onStop, isStreaming }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus()
  }, [isStreaming])

  const handleSubmit = () => {
    if (!value.trim() || isStreaming) return
    onSend(value.trim())
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-zinc-800 p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          disabled={isStreaming}
          className="flex-1 resize-none rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 disabled:opacity-50 transition-all"
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3 text-sm font-medium text-white transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        )}
      </div>
    </div>
  )
}
