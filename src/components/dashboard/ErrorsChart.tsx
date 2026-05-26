'use client'

import { useMemo } from 'react'
import type { InferenceLogRow } from '@/lib/supabase/types'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Pie, PieChart, Cell } from 'recharts'

interface Props {
  logs: InferenceLogRow[]
}

const chartConfig = {
  success: { label: 'Success', color: 'var(--chart-4)' },
  error: { label: 'Error', color: 'var(--destructive)' },
} satisfies ChartConfig

export default function ErrorsChart({ logs }: Props) {
  const { data, total } = useMemo(() => {
    const success = logs.filter(l => l.status === 'success').length
    const error = logs.length - success
    return {
      data: [
        { name: 'success', value: success, fill: 'var(--color-success)' },
        { name: 'error', value: error, fill: 'var(--color-error)' },
      ].filter(d => d.value > 0),
      total: logs.length,
    }
  }, [logs])

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center h-[280px]">
        <p className="text-xs text-muted-foreground">No data yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 relative">
      <h3 className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Success vs Errors</h3>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
        <span className="text-3xl font-bold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">requests</span>
      </div>
      <ChartContainer config={chartConfig} className="h-[240px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={65} outerRadius={85} strokeWidth={0}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="name" />} verticalAlign="bottom" />
        </PieChart>
      </ChartContainer>
    </div>
  )
}
