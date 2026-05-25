'use client'

import { useRef, useEffect } from 'react'
import type { InferenceLogRow } from '@/lib/supabase/types'

interface Props {
  logs: InferenceLogRow[]
}

export default function ErrorsChart({ logs }: Props) {
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

    const success = logs.filter(l => l.status === 'success').length
    const errors = logs.length - success

    const centerX = w / 2
    const centerY = h / 2
    const radius = Math.min(w, h) / 2 - 30
    const total = logs.length

    const slices = [
      { label: 'Success', count: success, color: '#22c55e' },
      { label: 'Error', count: errors, color: '#ef4444' },
    ].filter(s => s.count > 0)

    let startAngle = -Math.PI / 2
    slices.forEach(slice => {
      const angle = (slice.count / total) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle)
      ctx.closePath()
      ctx.fillStyle = slice.color
      ctx.fill()

      const midAngle = startAngle + angle / 2
      const labelR = radius * 0.65
      const lx = centerX + Math.cos(midAngle) * labelR
      const ly = centerY + Math.sin(midAngle) * labelR
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.round((slice.count / total) * 100)}%`, lx, ly)

      startAngle += angle
    })

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = '#18181b'
    ctx.fill()

    ctx.fillStyle = '#d4d4d8'
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(String(total), centerX, centerY + 5)

    let legendY = h - 15
    slices.forEach(slice => {
      ctx.fillStyle = slice.color
      ctx.beginPath()
      ctx.roundRect(10, legendY - 8, 10, 10, 2)
      ctx.fill()
      ctx.fillStyle = '#a1a1aa'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText(`${slice.label}: ${slice.count}`, 25, legendY)
      legendY += 0
    })
  }, [logs])

  return (
    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Success vs Errors</h3>
      <canvas ref={canvasRef} className="w-full h-48" />
      {logs.length === 0 && (
        <p className="text-xs text-zinc-600 text-center mt-2">No data yet</p>
      )}
    </div>
  )
}
