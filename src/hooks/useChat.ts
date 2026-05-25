'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage, ModelId } from '@/lib/sdk/types'

function generateId() {
  return crypto.randomUUID()
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [model, setModel] = useState<ModelId>('llama-3.3-70b-versatile')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let id = localStorage.getItem('llmtrace_session')
    if (!id) {
      id = generateId()
      localStorage.setItem('llmtrace_session', id)
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {})
    }
    setSessionId(id)
  }, [])

  const newSession = useCallback(() => {
    const id = generateId()
    localStorage.setItem('llmtrace_session', id)
    setSessionId(id)
    setMessages([])
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }, [])

  const loadSession = useCallback((id: string, msgs: ChatMessage[]) => {
    localStorage.setItem('llmtrace_session', id)
    setSessionId(id)
    setMessages(msgs)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming || !sessionId) return

      const userMsg: ChatMessage = { role: 'user', content }
      const updated = [...messages, userMsg]
      setMessages(updated)
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updated, model, sessionId }),
          signal: controller.signal,
        })

        if (!res.body) throw new Error('No response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''

        setMessages(prev => [...prev, { role: 'assistant', content: '' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break
              assistantContent += data
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = { role: 'assistant', content: assistantContent }
                return copy
              })
            }
          }
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: 'Error: Failed to get response.' },
          ])
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [messages, model, sessionId, isStreaming]
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { messages, isStreaming, sessionId, model, setModel, sendMessage, stopStreaming, newSession, loadSession }
}
