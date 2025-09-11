import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { Card, CardContent } from './Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

const performanceIndicatorVariants = cva(
  'inline-flex items-center gap-2 transition-all duration-200',
  {
    variants: {
      variant: {
        minimal: 'text-xs',
        compact: 'text-sm',
        detailed: 'text-sm p-2 rounded-md border',
        card: 'p-4 rounded-lg border shadow-sm bg-card'
      },
      severity: {
        excellent: 'text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950',
        good: 'text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950',
        warning: 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950',
        poor: 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950',
        neutral: 'text-muted-foreground border-border bg-background'
      }
    },
    defaultVariants: {
      variant: 'compact',
      severity: 'neutral'
    }
  }
);

// Performance metrics interfaces
export interface PerformanceMetrics {
  /** Page load time in milliseconds */
  pageLoadTime?: number;
  /** Memory usage in MB */
  memoryUsage?: number;
  /** Render time in milliseconds */
  renderTime?: number;
  /** Bundle size in KB */
  bundleSize?: number;
  /** Cumulative Layout Shift score */
  cls?: number;
  /** First Contentful Paint in milliseconds */
  fcp?: number;
  /** Largest Contentful Paint in milliseconds */
  lcp?: number;
  /** First Input Delay in milliseconds */
  fid?: number;
}

export interface PerformanceIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof performanceIndicatorVariants> {
  /** Performance metrics to display */
  metrics: PerformanceMetrics;
  /** Whether to show only development indicators */
  devOnly?: boolean;
  /** Custom thresholds for performance evaluation */
  thresholds?: PerformanceThresholds;
  /** Whether to show detailed breakdown on hover */
  showDetails?: boolean;
}

export interface PerformanceThresholds {
  excellent: { max: number };
  good: { max: number };
  warning: { max: number };
  // poor is anything above warning
}

// Default thresholds for different metrics
const DEFAULT_THRESHOLDS = {
  pageLoadTime: {
    excellent: { max: 1000 },
    good: { max: 2000 },
    warning: { max: 4000 }
  },
  memoryUsage: {
    excellent: { max: 50 },
    good: { max: 100 },
    warning: { max: 200 }
  },
  renderTime: {
    excellent: { max: 8 },
    good: { max: 16 },
    warning: { max: 32 }
  },
  bundleSize: {
    excellent: { max: 500 },
    good: { max: 1000 },
    warning: { max: 2000 }
  },
  cls: {
    excellent: { max: 0.1 },
    good: { max: 0.25 },
    warning: { max: 0.4 }
  },
  fcp: {
    excellent: { max: 1000 },
    good: { max: 1800 },
    warning: { max: 3000 }
  },
  lcp: {
    excellent: { max: 1200 },
    good: { max: 2500 },
    warning: { max: 4000 }
  },
  fid: {
    excellent: { max: 50 },
    good: { max: 100 },
    warning: { max: 300 }
  }
} as const;

/**
 * Get performance severity based on value and thresholds
 */
function getPerformanceSeverity(
  value: number,
  thresholds: PerformanceThresholds
): 'excellent' | 'good' | 'warning' | 'poor' {
  if (value <= thresholds.excellent.max) return 'excellent';
  if (value <= thresholds.good.max) return 'good';
  if (value <= thresholds.warning.max) return 'warning';
  return 'poor';
}

/**
 * Get the appropriate icon for a performance metric
 */
function getPerformanceIcon(severity: string): string {
  switch (severity) {
    case 'excellent':
      return '🚀';
    case 'good':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'poor':
      return '🐌';
    default:
      return '📊';
  }
}

/**
 * Format performance values for display
 */
function formatPerformanceValue(key: keyof PerformanceMetrics, value: number): string {
  switch (key) {
    case 'pageLoadTime':
    case 'renderTime':
    case 'fcp':
    case 'lcp':
    case 'fid':
      return `${value.toFixed(0)}ms`;
    case 'memoryUsage':
      return `${value.toFixed(1)}MB`;
    case 'bundleSize':
      return `${value.toFixed(0)}KB`;
    case 'cls':
      return value.toFixed(3);
    default:
      return value.toString();
  }
}

/**
 * Get human-readable metric names
 */
function getMetricLabel(key: keyof PerformanceMetrics): string {
  const labels: Record<keyof PerformanceMetrics, string> = {
    pageLoadTime: 'Page Load',
    memoryUsage: 'Memory',
    renderTime: 'Render',
    bundleSize: 'Bundle Size',
    cls: 'CLS',
    fcp: 'FCP',
    lcp: 'LCP',
    fid: 'FID'
  };
  return labels[key] || key;
}

/**
 * Calculate overall performance score
 */
function calculateOverallScore(metrics: PerformanceMetrics): {
  score: number;
  grade: 'excellent' | 'good' | 'warning' | 'poor';
} {
  const scores: number[] = [];
  
  Object.entries(metrics).forEach(([key, value]) => {
    if (value !== undefined) {
      const metricKey = key as keyof PerformanceMetrics;
      const thresholds = DEFAULT_THRESHOLDS[metricKey];
      if (thresholds) {
        const severity = getPerformanceSeverity(value, thresholds);
        const score = severity === 'excellent' ? 100 :
                     severity === 'good' ? 75 :
                     severity === 'warning' ? 50 : 25;
        scores.push(score);
      }
    }
  });

  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  const grade = averageScore >= 90 ? 'excellent' :
                averageScore >= 75 ? 'good' :
                averageScore >= 50 ? 'warning' : 'poor';

  return { score: averageScore, grade };
}

/**
 * Performance Indicator Component
 * 
 * Displays performance metrics with visual indicators for quick assessment.
 * Supports different display variants from minimal badges to detailed cards.
 * 
 * @example
 * ```tsx
 * // Minimal render time indicator
 * <PerformanceIndicator 
 *   variant="minimal" 
 *   metrics={{ renderTime: 12 }} 
 * />
 * 
 * // Detailed performance card
 * <PerformanceIndicator 
 *   variant="card" 
 *   metrics={{ 
 *     pageLoadTime: 1500, 
 *     memoryUsage: 75, 
 *     bundleSize: 800 
 *   }}
 *   showDetails
 * />
 * 
 * // Development-only memory indicator
 * <PerformanceIndicator 
 *   variant="compact" 
 *   metrics={{ memoryUsage: 120 }} 
 *   devOnly 
 * />
 * ```
 */
const PerformanceIndicator = React.forwardRef<HTMLDivElement, PerformanceIndicatorProps>(
  ({ 
    className, 
    variant, 
    severity: forcedSeverity, 
    metrics, 
    devOnly = false,
    thresholds,
    showDetails = false,
    ...props 
  }, ref) => {
    // Skip rendering in production if devOnly is true
    if (devOnly && process.env.NODE_ENV === 'production') {
      return null;
    }

    // Calculate overall performance if multiple metrics
    const metricEntries = Object.entries(metrics).filter(([_, value]) => value !== undefined);
    
    if (metricEntries.length === 0) {
      return null;
    }

    const { score, grade: overallGrade } = calculateOverallScore(metrics);
    const displaySeverity = forcedSeverity || overallGrade;

    // For minimal variant, show just the most important metric
    if (variant === 'minimal') {
      const primaryMetric = metricEntries[0];
      const [key, value] = primaryMetric as [keyof PerformanceMetrics, number];
      const metricThresholds = thresholds || DEFAULT_THRESHOLDS[key];
      const metricSeverity = metricThresholds ? getPerformanceSeverity(value, metricThresholds) : 'neutral';
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                ref={ref}
                variant={metricSeverity === 'excellent' ? 'success' : 
                        metricSeverity === 'good' ? 'secondary' :
                        metricSeverity === 'warning' ? 'warning' : 'destructive'}
                className={cn('cursor-help', className)}
                {...props}
              >
                {getPerformanceIcon(metricSeverity)} {formatPerformanceValue(key, value)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getMetricLabel(key)}: {formatPerformanceValue(key, value)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // For detailed variants
    const content = (
      <div className="space-y-2">
        {metricEntries.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPerformanceIcon(displaySeverity)}</span>
            <span className="font-medium">
              Performance Score: {score.toFixed(0)}%
            </span>
          </div>
        )}
        
        {variant === 'card' || showDetails ? (
          <div className="grid gap-2">
            {metricEntries.map(([key, value]) => {
              const metricKey = key as keyof PerformanceMetrics;
              const metricThresholds = thresholds || DEFAULT_THRESHOLDS[metricKey];
              const metricSeverity = metricThresholds ? getPerformanceSeverity(value as number, metricThresholds) : 'neutral';
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {getMetricLabel(metricKey)}
                  </span>
                  <Badge 
                    variant={metricSeverity === 'excellent' ? 'success' : 
                            metricSeverity === 'good' ? 'secondary' :
                            metricSeverity === 'warning' ? 'warning' : 'destructive'}
                    size="sm"
                  >
                    {formatPerformanceValue(metricKey, value as number)}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          // Compact variant
          <div className="flex items-center gap-2">
            <span className="text-sm">{getPerformanceIcon(displaySeverity)}</span>
            <span className="text-sm">
              {metricEntries.length === 1 
                ? `${getMetricLabel(metricEntries[0][0] as keyof PerformanceMetrics)}: ${formatPerformanceValue(metricEntries[0][0] as keyof PerformanceMetrics, metricEntries[0][1] as number)}`
                : `Performance: ${score.toFixed(0)}%`
              }
            </span>
          </div>
        )}
      </div>
    );

    if (variant === 'card') {
      return (
        <Card ref={ref} className={cn(className)} {...props}>
          <CardContent className="p-4">
            {content}
          </CardContent>
        </Card>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          performanceIndicatorVariants({ variant, severity: displaySeverity }),
          className
        )}
        {...props}
      >
        {content}
      </div>
    );
  }
);

PerformanceIndicator.displayName = 'PerformanceIndicator';

/**
 * Specialized component for memory usage indication
 */
export const MemoryIndicator = React.forwardRef<HTMLDivElement, Omit<PerformanceIndicatorProps, 'metrics'> & { memoryMB: number }>(
  ({ memoryMB, ...props }, ref) => (
    <PerformanceIndicator 
      ref={ref}
      metrics={{ memoryUsage: memoryMB }}
      {...props}
    />
  )
);

MemoryIndicator.displayName = 'MemoryIndicator';

/**
 * Specialized component for render time indication
 */
export const RenderTimeIndicator = React.forwardRef<HTMLDivElement, Omit<PerformanceIndicatorProps, 'metrics'> & { renderTimeMs: number }>(
  ({ renderTimeMs, ...props }, ref) => (
    <PerformanceIndicator 
      ref={ref}
      metrics={{ renderTime: renderTimeMs }}
      {...props}
    />
  )
);

RenderTimeIndicator.displayName = 'RenderTimeIndicator';

/**
 * Specialized component for page load time indication
 */
export const PageLoadIndicator = React.forwardRef<HTMLDivElement, Omit<PerformanceIndicatorProps, 'metrics'> & { loadTimeMs: number }>(
  ({ loadTimeMs, ...props }, ref) => (
    <PerformanceIndicator 
      ref={ref}
      metrics={{ pageLoadTime: loadTimeMs }}
      {...props}
    />
  )
);

PageLoadIndicator.displayName = 'PageLoadIndicator';

/**
 * Development-only performance overlay component
 */
export const PerformanceOverlay = React.forwardRef<HTMLDivElement, { 
  metrics: PerformanceMetrics;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}>(({ metrics, position = 'bottom-right', className }, ref) => {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div 
      ref={ref}
      className={cn(
        'fixed z-50 pointer-events-none',
        positionClasses[position],
        className
      )}
    >
      <PerformanceIndicator 
        variant="compact"
        metrics={metrics}
        className="pointer-events-auto bg-background/80 backdrop-blur-sm shadow-lg"
      />
    </div>
  );
});

PerformanceOverlay.displayName = 'PerformanceOverlay';

export { 
  PerformanceIndicator, 
  performanceIndicatorVariants,
  DEFAULT_THRESHOLDS,
  calculateOverallScore,
  getPerformanceSeverity,
  formatPerformanceValue,
  getMetricLabel
};