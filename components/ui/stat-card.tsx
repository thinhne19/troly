// components/ui/stat-card.tsx — Dense KPI Stat Card (12px Radius, Level 1 Elevation)
import * as React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  iconColor?: string;
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  trend,
  icon: Icon,
  iconColor = 'text-indigo-600 bg-indigo-50',
  progress,
  className,
}: StatCardProps) {
  const progressPct = progress ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;

  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-[12px] p-5 transition-shadow hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-[10px] shrink-0', iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-semibold',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {trend.value}
          </span>
        )}
        {subValue && <span className="text-slate-500">{subValue}</span>}
      </div>

      {progress && (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
            <span>{progress.label || 'Tiến độ thu'}</span>
            <span className="tabular-nums font-semibold text-slate-700">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
