'use client'

import { useChat } from '@/hooks/useChat'
import { PROVIDERS } from '@/constants/models'
import ConversationList from '@/components/chat/ConversationList'
import ChatWindow from '@/components/chat/ChatWindow'
import ChatInput from '@/components/chat/ChatInput'
import type { ModelId } from '@/lib/sdk/types'
import Link from 'next/link'

export default function ChatPage() {
  const { messages, isStreaming, sessionId, model, setModel, sendMessage, stopStreaming, newSession, loadSession } = useChat()

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <ConversationList
        currentSessionId={sessionId}
        onResume={loadSession}
        onNew={newSession}
      />

      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              LLMTrace
            </h1>
            <select
              value={model || 'llama-3.3-70b-versatile'}
              onChange={e => setModel(e.target.value as ModelId)}
              disabled={isStreaming}
              className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {PROVIDERS.flatMap(p =>
                p.models.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))
              )}
            </select>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
          >
            Dashboard →
          </Link>
        </header>

        <ChatWindow messages={messages} isStreaming={isStreaming} />
        <ChatInput onSend={sendMessage} onStop={stopStreaming} isStreaming={isStreaming} />
      </div>
    </div>
  )
}
