'use client'

import { useMemo } from 'react'
import type { InferenceLogRow } from '@/lib/supabase/types'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

interface Props {
  logs: InferenceLogRow[]
}

export default function LatencyChart({ logs }: Props) {
  const { data, chartConfig } = useMemo(() => {
    const validLogs = logs.filter(l => Boolean(l.model))
    const sorted = [...validLogs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    const recent = sorted.slice(-50)
    const models = [...new Set(recent.map(l => l.model))]

    const config: ChartConfig = {}
    models.forEach((m, i) => {
      const safeKey = m.replace(/\./g, '_')
      config[safeKey] = { label: m, color: `var(--chart-${(i % 5) + 1})` }
    })

    const points = recent.map(l => ({
      time: new Date(l.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      [l.model.replace(/\./g, '_')]: l.latency_ms,
    }))

    return { data: points.length === 1 ? [points[0], { ...points[0] }] : points, chartConfig: config }
  }, [logs])

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center h-[280px]">
        <p className="text-xs text-muted-foreground">No data yet</p>
      </div>
    )
  }

  const models = Object.keys(chartConfig)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Latency over time</h3>
      <ChartContainer config={chartConfig} className="h-[240px] w-full">
        <AreaChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            fontSize={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={v => `${v}ms`}
            fontSize={10}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          {models.map(m => {
            const safeKey = m.replace(/\./g, '_')
            return (
              <Area
                key={m}
                dataKey={safeKey}
                type="monotone"
                fill={`var(--color-${m})`}
                fillOpacity={0.15}
                stroke={`var(--color-${m})`}
                strokeWidth={2}
                dot={{ r: 3, fill: `var(--color-${m})`, strokeWidth: 0, fillOpacity: 1 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls
              />
            )
          })}
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
