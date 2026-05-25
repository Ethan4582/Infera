'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import type { SessionRow, MessageRow } from '@/lib/supabase/types'
import type { ChatMessage } from '@/lib/sdk/types'

export function useConversations() {
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions')
      const data = await res.json()
      if (Array.isArray(data)) setSessions(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const resume = useCallback(async (id: string): Promise<ChatMessage[]> => {
    const sb = getSupabaseBrowser()
    const { data } = await sb
      .from('messages')
      .select('role, content')
      .eq('session_id', id)
      .order('created_at', { ascending: true })

    return (data as MessageRow[] | null)?.map(m => ({
      role: m.role as ChatMessage['role'],
      content: m.content,
    })) ?? []
  }, [])

  const cancel = useCallback(async (id: string) => {
    await fetch('/api/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setSessions(prev => prev.filter(s => s.id !== id))
  }, [])

  return { sessions, loading, resume, cancel, refresh: fetchSessions }
}