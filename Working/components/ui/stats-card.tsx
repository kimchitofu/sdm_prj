import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info'
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  variant = 'default',
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-azure-50 border-azure-200 dark:bg-azure-950/20 dark:border-azure-800',
    warning: 'bg-azure-50 border-azure-200 dark:bg-azure-950/20 dark:border-azure-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
  }

  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-azure-100 text-azure-700 dark:bg-azure-900/40 dark:text-azure-400',
    warning: 'bg-azure-100 text-azure-700 dark:bg-azure-900/40 dark:text-azure-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn('rounded-lg p-2', iconStyles[variant])}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-azure-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}