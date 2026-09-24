// components/ui/badge.tsx — Status Chips & Badges
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors select-none',
  {
    variants: {
      variant: {
        // Default slate
        neutral: 'bg-slate-100 text-slate-700 border-slate-200',
        // Success: Emerald
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        // Warning: Amber
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        // Error: Rose
        error: 'bg-rose-50 text-rose-700 border-rose-200',
        // Info: Sky
        info: 'bg-sky-50 text-sky-700 border-sky-200',
        // Primary: Indigo
        brand: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      },
      size: {
        sm: 'text-[11px] px-2 py-0.2',
        md: 'text-xs px-2.5 py-0.5',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  const dotColor = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-sky-500',
    brand: 'bg-indigo-500',
  }[variant || 'neutral'];

  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />}
      {children}
    </div>
  );
}
