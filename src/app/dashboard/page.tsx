'use client'

import { useState } from 'react'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import LatencyChart from '@/components/dashboard/LatencyChart'
import ThroughputChart from '@/components/dashboard/ThroughputChart'
import ErrorsChart from '@/components/dashboard/ErrorsChart'
import Link from 'next/link'

export default function DashboardPage() {
  const { logs, loading } = useRealtimeMetrics()
  const [modelFilter, setModelFilter] = useState<string>('all')

  const filtered = modelFilter === 'all'
    ? logs
    : logs.filter(l => l.model === modelFilter)

  const uniqueModels = [...new Set(logs.map(l => l.model))]

  const avgLatency = filtered.length > 0
    ? Math.round(filtered.reduce((s, l) => s + l.latency_ms, 0) / filtered.length)
    : 0
  const totalTokens = filtered.reduce((s, l) => s + l.prompt_tokens + l.completion_tokens, 0)
  const errorRate = filtered.length > 0
    ? Math.round((filtered.filter(l => l.status !== 'success').length / filtered.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          LLMTrace Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={modelFilter}
            onChange={e => setModelFilter(e.target.value)}
            className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Models</option>
            {uniqueModels.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <Link
            href="/chat"
            className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
          >
            ← Chat
          </Link>
        </div>
      </header>

      <div className="p-6">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading metrics...</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                <p className="text-xs text-zinc-500 mb-1">Avg Latency</p>
                <p className="text-2xl font-bold text-indigo-400">{avgLatency}ms</p>
              </div>
              <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                <p className="text-xs text-zinc-500 mb-1">Total Tokens</p>
                <p className="text-2xl font-bold text-purple-400">{totalTokens.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                <p className="text-xs text-zinc-500 mb-1">Error Rate</p>
                <p className={`text-2xl font-bold ${errorRate > 10 ? 'text-red-400' : 'text-green-400'}`}>
                  {errorRate}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <LatencyChart logs={filtered} />
              <ThroughputChart logs={filtered} />
              <ErrorsChart logs={filtered} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
