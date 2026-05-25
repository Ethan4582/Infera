'use client'

import { useRef, useEffect } from 'react'
import type { InferenceLogRow } from '@/lib/supabase/types'

interface Props {
  logs: InferenceLogRow[]
}

export default function LatencyChart({ logs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || logs.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = rect.height

    ctx.clearRect(0, 0, w, h)

    const data = logs.slice(-30)
    const maxLatency = Math.max(...data.map(l => l.latency_ms), 100)
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    ctx.strokeStyle = '#27272a'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()

      ctx.fillStyle = '#71717a'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(`${Math.round(maxLatency - (maxLatency / 4) * i)}ms`, padding.left - 8, y + 3)
    }

    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')

    ctx.beginPath()
    ctx.moveTo(padding.left, h - padding.bottom)

    data.forEach((log, i) => {
      const x = padding.left + (chartW / Math.max(data.length - 1, 1)) * i
      const y = padding.top + chartH * (1 - log.latency_ms / maxLatency)
      ctx.lineTo(x, y)
    })

    ctx.lineTo(padding.left + chartW, h - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.beginPath()
    data.forEach((log, i) => {
      const x = padding.left + (chartW / Math.max(data.length - 1, 1)) * i
      const y = padding.top + chartH * (1 - log.latency_ms / maxLatency)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 2
    ctx.stroke()

    data.forEach((log, i) => {
      const x = padding.left + (chartW / Math.max(data.length - 1, 1)) * i
      const y = padding.top + chartH * (1 - log.latency_ms / maxLatency)
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#6366f1'
      ctx.fill()
    })
  }, [logs])

  return (
    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Latency (ms)</h3>
      <canvas ref={canvasRef} className="w-full h-48" />
      {logs.length === 0 && (
        <p className="text-xs text-zinc-600 text-center mt-2">No data yet</p>
      )}
    </div>
  )
}
