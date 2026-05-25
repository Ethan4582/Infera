'use client'

import { useRef, useEffect } from 'react'
import type { InferenceLogRow } from '@/lib/supabase/types'

interface Props {
  logs: InferenceLogRow[]
}

const MODEL_COLORS: Record<string, string> = {
  'llama-3.3-70b-versatile': '#6366f1',
  'mixtral-8x7b-32768': '#8b5cf6',
  'gemma2-9b-it': '#a78bfa',
}

export default function ThroughputChart({ logs }: Props) {
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

    const counts: Record<string, number> = {}
    logs.forEach(l => {
      counts[l.model] = (counts[l.model] || 0) + 1
    })

    const models = Object.keys(counts)
    if (models.length === 0) return

    const maxCount = Math.max(...Object.values(counts))
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom
    const barWidth = Math.min(60, chartW / models.length - 20)

    models.forEach((model, i) => {
      const x = padding.left + (chartW / models.length) * i + (chartW / models.length - barWidth) / 2
      const barH = (counts[model] / maxCount) * chartH
      const y = padding.top + chartH - barH

      const gradient = ctx.createLinearGradient(x, y, x, y + barH)
      const color = MODEL_COLORS[model] || '#6366f1'
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, color + '40')

      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0])
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.fillStyle = '#71717a'
      ctx.font = '9px system-ui'
      ctx.textAlign = 'center'
      const label = model.split('-').slice(0, 2).join('-')
      ctx.fillText(label, x + barWidth / 2, h - padding.bottom + 15)

      ctx.fillStyle = '#d4d4d8'
      ctx.font = '11px system-ui'
      ctx.fillText(String(counts[model]), x + barWidth / 2, y - 6)
    })
  }, [logs])

  return (
    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Requests by Model</h3>
      <canvas ref={canvasRef} className="w-full h-48" />
      {logs.length === 0 && (
        <p className="text-xs text-zinc-600 text-center mt-2">No data yet</p>
      )}
    </div>
  )
}
