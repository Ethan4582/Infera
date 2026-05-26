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

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`)
        }
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
              try {
                const parsed = JSON.parse(data)
                if (parsed.error) {
                  throw new Error(parsed.error)
                }
                assistantContent += parsed.text
              } catch (e: any) {
                if (e.message && e.message !== 'Unexpected end of JSON input' && !e.message.includes('JSON')) {
                  throw e
                }
                // fallback for older streams if necessary
                if (!data.includes('"error"')) {
                  assistantContent += data
                }
              }
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
          let errorMessage = 'Error: Failed to get response.'
          
          if (model === 'gemma2-9b-it' || model === 'mixtral-8x7b-32768') {
            const mName = model === 'gemma2-9b-it' ? 'Gemma 2 9B' : 'Mixtral 8x7B'
            errorMessage = `⚠️ **Model Discontinued:** The selected model (${mName}) has been discontinued by Groq. The app automatically recommends switching to **LLaMA 3.3 70B** for future messages. Please try again.`
            setModel('llama-3.3-70b-versatile')
          } else {
            errorMessage = `⚠️ **Error:** ${(e as Error).message || 'Failed to get response.'}`
          }

          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: errorMessage },
          ])
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [messages, model, sessionId, isStreaming]
  )

  const regenerate = useCallback(
    async (targetModel?: ModelId) => {
      if (isStreaming || !sessionId || messages.length < 2) return

      const lastUserIndex = messages.map(m => m.role).lastIndexOf('user')
      if (lastUserIndex === -1) return

      const updated = messages.slice(0, lastUserIndex + 1)
      setMessages(updated)
      setIsStreaming(true)

      const activeModel = targetModel || model
      if (targetModel && targetModel !== model) {
        setModel(targetModel)
      }

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updated, model: activeModel, sessionId }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`)
        }
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
              try {
                const parsed = JSON.parse(data)
                if (parsed.error) {
                  throw new Error(parsed.error)
                }
                assistantContent += parsed.text
              } catch (e: any) {
                if (e.message && e.message !== 'Unexpected end of JSON input' && !e.message.includes('JSON')) {
                  throw e
                }
                // fallback for older streams if necessary
                if (!data.includes('"error"')) {
                  assistantContent += data
                }
              }
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
          let errorMessage = 'Error: Failed to get response.'
          if (activeModel === 'gemma2-9b-it' || activeModel === 'mixtral-8x7b-32768') {
            const mName = activeModel === 'gemma2-9b-it' ? 'Gemma 2 9B' : 'Mixtral 8x7B'
            errorMessage = `⚠️ **Model Discontinued:** The selected model (${mName}) has been discontinued by Groq. The app automatically recommends switching to **LLaMA 3.3 70B** for future messages. Please try again.`
            setModel('llama-3.3-70b-versatile')
          } else {
            errorMessage = `⚠️ **Error:** ${(e as Error).message || 'Failed to get response.'}`
          }
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: errorMessage },
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

  return { messages, isStreaming, sessionId, model, setModel, sendMessage, regenerate, stopStreaming, newSession, loadSession }
}
