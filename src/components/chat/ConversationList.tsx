'use client'

import { useState, useEffect, useRef } from 'react'
import { useConversations } from '@/hooks/useConversations'
import type { ChatMessage } from '@/lib/sdk/types'
import { MessageSquare, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    try {
      setCustomNames(JSON.parse(localStorage.getItem('llmtrace_chat_names') || '{}'))
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingId])

  const handleResume = async (id: string) => {
    if (editingId) return
    onLoadingChange?.(true)
    const msgs = await resume(id)
    onResume(id, msgs)
    onLoadingChange?.(false)
  }

  const startRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(id)
    setEditValue(customNames[id] || `${id.slice(0, 8)}...`)
  }

  const submitRename = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (editValue.trim()) {
      const updated = { ...customNames, [id]: editValue.trim() }
      setCustomNames(updated)
      localStorage.setItem('llmtrace_chat_names', JSON.stringify(updated))
    }
    setEditingId(null)
  }

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') submitRename(id)
    if (e.key === 'Escape') setEditingId(null)
  }

  const handleDeleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      cancel(deleteId)
      setDeleteId(null)
      setToastMsg('Chat deleted successfully')
      setTimeout(() => setToastMsg(null), 3000)
    }
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
    <div className="w-[280px] flex flex-col bg-sidebar h-full relative">
      <div className="px-5 pt-6 pb-4 flex items-center gap-2">
        <span className="font-semibold text-[13px] text-sidebar-foreground tracking-tight uppercase text-muted-foreground/70">Recent</span>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={onNew}
          className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 text-sm font-medium transition-all shadow-sm"
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
        {loading && (
          <div className="space-y-1.5 pt-1">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 w-full rounded-xl bg-sidebar-accent/50 animate-pulse" />
            ))}
          </div>
        )}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium">No threads yet</span>
          </div>
        )}
        {sessions.map(session => (
          <div
            key={session.id}
            className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm cursor-pointer transition-colors duration-150 ${
              session.id === currentSessionId
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
            onClick={() => handleResume(session.id)}
          >
            {editingId === session.id ? (
              <div className="flex items-center gap-2 w-full pr-1" onClick={e => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, session.id)}
                  className="flex-1 bg-background text-foreground text-[13px] px-2 py-1 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
                />
                <button onClick={e => submitRename(session.id, e)} className="p-1 hover:bg-muted rounded text-green-500">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={cancelRename} className="p-1 hover:bg-muted rounded text-destructive">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="truncate text-[14px] font-medium leading-tight mb-0.5">{customNames[session.id] || `${session.id.slice(0, 8)}...`}</div>
                  <div className="text-[11px] opacity-60 font-medium">{formatDate(session.created_at)}</div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-sidebar-foreground/50 hover:text-sidebar-foreground p-1.5 rounded-lg hover:bg-sidebar-accent/80 transition-all shrink-0 data-[state=open]:opacity-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={(e) => startRename(session.id, e as any)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleDeleteRequest(session.id, e as any)} className="text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-[400px] max-w-[90%] bg-card border border-border rounded-3xl p-6 shadow-lg shadow-black/20 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold mb-3">Delete chat?</h3>
            <p className="text-[15px] text-muted-foreground mb-1">
              This will delete <strong className="text-foreground">{customNames[deleteId] || 'this conversation'}</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-card border border-border shadow-lg rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
