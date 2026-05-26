'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  title: string
}

interface State {
  hasError: boolean
}

export default class ChartErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="flex flex-col border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{this.props.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[280px] flex flex-col items-center justify-center text-muted-foreground opacity-70">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium">Chart unavailable</p>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
