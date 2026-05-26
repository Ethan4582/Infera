'use client'

import { useState, useEffect } from 'react'
import { useConversations } from '@/hooks/useConversations'
import type { ChatMessage } from '@/lib/sdk/types'
import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface Props {
  currentSessionId: string
  onResume: (id: string, messages: ChatMessage[]) => void
  onNew: () => void
  onLoadingChange?: (loading: boolean) => void
}

export default function ConversationList({ currentSessionId, onResume, onNew, onLoadingChange }: Props) {
  const { sessions, loading, resume, cancel } = useConversations()
  const [customNames, setCustomNames] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      setCustomNames(JSON.parse(localStorage.getItem('llmtrace_chat_names') || '{}'))
    } catch (e) {}
  }, [])

  const handleResume = async (id: string) => {
    onLoadingChange?.(true)
    const msgs = await resume(id)
    onResume(id, msgs)
    onLoadingChange?.(false)
  }

  const handleRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const name = window.prompt('Rename conversation:')
    if (name) {
      const updated = { ...customNames, [id]: name }
      setCustomNames(updated)
      localStorage.setItem('llmtrace_chat_names', JSON.stringify(updated))
    }
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    cancel(id)
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-[260px] flex flex-col bg-sidebar h-full">
      <div className="px-4 pt-5 pb-3 flex items-center gap-2">
        <span className="font-semibold text-sm text-sidebar-foreground tracking-tight"></span>
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={onNew}
          className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2.5 text-sm font-medium transition-colors"
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {loading && (
          <div className="space-y-1.5 pt-1">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 w-full rounded-lg bg-sidebar-accent/50 animate-pulse" />
            ))}
          </div>
        )}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50">
            <MessageSquare className="w-6 h-6 mb-1.5" />
            <span className="text-xs">No threads yet</span>
          </div>
        )}
        {sessions.map(session => (
          <div
            key={session.id}
            className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors duration-100 ${
              session.id === currentSessionId
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
            onClick={() => handleResume(session.id)}
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="truncate text-[13px]">{customNames[session.id] || `${session.id.slice(0, 8)}...`}</div>
              <div className="text-[11px] opacity-50 mt-0.5">{formatDate(session.created_at)}</div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className="opacity-0 group-hover:opacity-100 text-sidebar-foreground/50 hover:text-sidebar-foreground p-1 rounded hover:bg-sidebar-accent/50 transition-all shrink-0 data-[state=open]:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => handleRename(session.id, e as any)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleDelete(session.id, e as any)} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  )
}
