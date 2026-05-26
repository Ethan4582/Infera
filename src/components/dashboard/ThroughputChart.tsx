'use client'

import { useMemo } from 'react'
import type { InferenceLogRow } from '@/lib/supabase/types'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

interface Props {
  logs: InferenceLogRow[]
}

const chartConfig = {
  success: { label: 'Success', color: 'var(--chart-4)' },
  error: { label: 'Error', color: 'var(--destructive)' },
} satisfies ChartConfig

export default function ThroughputChart({ logs }: Props) {
  const data = useMemo(() => {
    const counts: Record<string, { success: number; error: number }> = {}
    logs.forEach(l => {
      if (!counts[l.model]) counts[l.model] = { success: 0, error: 0 }
      if (l.status === 'success') counts[l.model].success += 1
      else counts[l.model].error += 1
    })
    return Object.keys(counts).map(model => ({
      model: model.split('-').slice(0, 2).join('-'),
      success: counts[model].success,
      error: counts[model].error,
    }))
  }, [logs])

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center h-[280px]">
        <p className="text-xs text-muted-foreground">No data yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Requests by Model</h3>
      <ChartContainer config={chartConfig} className="h-[240px] w-full">
        <BarChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="model" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="success" stackId="a" fill="var(--color-success)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="error" stackId="a" fill="var(--color-error)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
