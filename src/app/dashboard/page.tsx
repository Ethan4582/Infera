'use client'

import { useState } from 'react'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import LatencyChart from '@/components/dashboard/LatencyChart'
import ThroughputChart from '@/components/dashboard/ThroughputChart'
import ErrorsChart from '@/components/dashboard/ErrorsChart'
import Link from 'next/link'
import { BarChart2, ArrowLeft } from 'lucide-react'

export default function DashboardPage() {
  const { logs: rawLogs, loading } = useRealtimeMetrics()
  const logs = rawLogs.filter(l => Boolean(l.model && l.model.trim() !== ''))
  const [modelFilter, setModelFilter] = useState<string>('all')
  const [page, setPage] = useState(0)

  const filtered = modelFilter === 'all' ? logs : logs.filter(l => l.model === modelFilter)
  const uniqueModels = [...new Set(logs.map(l => l.model))]

  const avgLatency = filtered.length > 0
    ? Math.round(filtered.reduce((s, l) => s + l.latency_ms, 0) / filtered.length)
    : 0
  const totalTokens = filtered.reduce((s, l) => s + l.prompt_tokens + l.completion_tokens, 0)
  const totalRequests = filtered.length
  const modelsUsed = [...new Set(filtered.map(l => l.model))].length
  const errors = filtered.filter(l => l.status !== 'success').length
  const errorRate = totalRequests > 0 ? Math.round((errors / totalRequests) * 100) : 0

  const half = Math.floor(filtered.length / 2)
  const newAvg = half > 0 ? filtered.slice(0, half).reduce((s, l) => s + l.latency_ms, 0) / half : 0
  const oldAvg = half > 0 ? filtered.slice(half).reduce((s, l) => s + l.latency_ms, 0) / (filtered.length - half) : 0
  const latDiff = Math.round(newAvg - oldAvg)
  const latTrend = isNaN(latDiff) || latDiff === 0 ? 'Stable' : latDiff > 0 ? `↑ ${latDiff}ms` : `↓ ${Math.abs(latDiff)}ms`
  const latColor = latDiff > 0 ? 'text-destructive' : 'text-green-500'

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center gap-4 px-6 py-3">
        <Link href="/chat" className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">L</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
              <p className="text-xs text-muted-foreground/60">Inference monitoring</p>
            </div>
          </div>
        </div>
        <select
          value={modelFilter}
          onChange={e => setModelFilter(e.target.value)}
          className="text-center rounded-lg bg-card border border-border text-foreground px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="all">All Models</option>
          {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </header>

      <div className="h-px bg-border" />

      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-[280px] rounded-xl bg-card border border-border animate-pulse" />)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] max-w-6xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5">
              <BarChart2 className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No inference logs yet</h2>
            <p className="text-sm text-muted-foreground/60 mb-6">Send a message to start collecting data</p>
            <Link href="/chat" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Go to Chat
            </Link>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Avg Latency" value={`${avgLatency}ms`} sub={latTrend} subColor={latColor} />
              <StatCard label="Total Requests" value={String(totalRequests)} sub={`${modelsUsed} model${modelsUsed > 1 ? 's' : ''}`} />
              <StatCard label="Total Tokens" value={totalTokens.toLocaleString()} sub="prompt + completion" />
              <StatCard label="Error Rate" value={`${errorRate}%`} sub={`${errors} / ${totalRequests}`} valueColor={errorRate > 20 ? 'text-destructive' : undefined} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <LatencyChart logs={filtered} />
              <ThroughputChart logs={filtered} />
              <ErrorsChart logs={filtered} />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold">Recent Logs</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-green-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(0, p - 1))} 
                      disabled={page === 0}
                      className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-50 hover:bg-muted transition-colors"
                    >Prev</button>
                    <button 
                      onClick={() => setPage(p => p + 1)} 
                      disabled={(page + 1) * 10 >= filtered.length}
                      className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-50 hover:bg-muted transition-colors"
                    >Next</button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Time</th>
                      <th className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Session</th>
                      <th className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Model</th>
                      <th className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Latency</th>
                      <th className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Tokens</th>
                      <th className="px-5 py-2.5 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(page * 10, (page + 1) * 10).map((log, i) => {
                      const latMs = log.latency_ms
                      const latClass = latMs < 300 ? 'text-green-500' : latMs < 800 ? 'text-amber-500' : 'text-destructive'
                      return (
                        <tr key={i} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </td>
                          <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{log.session_id.slice(0, 8)}</td>
                          <td className="px-5 py-2.5 text-xs">{log.model}</td>
                          <td className={`px-5 py-2.5 text-xs font-medium ${latClass}`}>{latMs}ms</td>
                          <td className="px-5 py-2.5 text-xs text-muted-foreground">{log.prompt_tokens + log.completion_tokens}</td>
                          <td className="px-5 py-2.5">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              log.status === 'success'
                                ? 'text-green-400 bg-green-500/10'
                                : 'text-destructive bg-destructive/10'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, sub, subColor, valueColor }: {
  label: string
  value: string
  sub: string
  subColor?: string
  valueColor?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1.5 ${valueColor || ''}`}>{value}</p>
      <p className={`text-xs mt-1 ${subColor || 'text-muted-foreground/50'}`}>{sub}</p>
    </div>
  )
}
