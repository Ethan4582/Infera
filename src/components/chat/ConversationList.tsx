'use client'

import { useConversations } from '@/hooks/useConversations'
import type { ChatMessage } from '@/lib/sdk/types'

interface Props {
  currentSessionId: string
  onResume: (id: string, messages: ChatMessage[]) => void
  onNew: () => void
}

export default function ConversationList({ currentSessionId, onResume, onNew }: Props) {
  const { sessions, loading, resume, cancel } = useConversations()

  const handleResume = async (id: string) => {
    const msgs = await resume(id)
    onResume(id, msgs)
  }

  return (
    <div className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-900/50">
      <div className="p-3 border-b border-zinc-800">
        <button
          onClick={onNew}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-sm font-medium text-white transition-colors"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && <p className="text-xs text-zinc-500 p-2">Loading...</p>}
        {sessions.map(session => (
          <div
            key={session.id}
            className={`group rounded-lg p-2 text-xs cursor-pointer transition-colors ${
              session.id === currentSessionId
                ? 'bg-indigo-600/20 text-indigo-300'
                : 'text-zinc-400 hover:bg-zinc-800/50'
            }`}
            onClick={() => handleResume(session.id)}
          >
            <div className="truncate font-medium">{session.id.slice(0, 8)}...</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-zinc-600">
                {new Date(session.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation()
                  cancel(session.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
