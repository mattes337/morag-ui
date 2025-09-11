import { Metadata } from 'next'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export const metadata: Metadata = {
  title: 'Analytics | MoRAG',
  description: 'Comprehensive analytics dashboard showing processing metrics, document volume charts, and performance analytics for the MoRAG platform.',
}

/**
 * Analytics page component that displays comprehensive analytics dashboard
 * with real-time metrics, charts, and performance monitoring
 */
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Monitor system performance, document processing metrics, and usage trends
        </p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  )
}