'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import type { InferenceLogRow } from '@/lib/supabase/types'

const MAX_LOGS = 100

export function useRealtimeMetrics() {
  const [logs, setLogs] = useState<InferenceLogRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInitial = useCallback(async () => {
    const sb = getSupabaseBrowser()
    const { data } = await sb
      .from('inference_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_LOGS)

    if (data) setLogs(data.reverse() as InferenceLogRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchInitial()

    const sb = getSupabaseBrowser()
    const channel = sb
      .channel('inference_logs_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inference_logs' },
        (payload) => {
          setLogs(prev => {
            const updated = [...prev, payload.new as InferenceLogRow]
            return updated.slice(-MAX_LOGS)
          })
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [fetchInitial])

  return { logs, loading }
}