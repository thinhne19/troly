'use client';

// components/ui/button.tsx — Troly Master Spec v1.0 Button Component
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Primary: Indigo 600
        primary:
          'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm',
        // Secondary: Level 1 border
        secondary:
          'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
        // Ghost: Zero border, flat
        ghost:
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
        // Danger: Rose 600
        danger:
          'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
        // Outline subtle
        outline:
          'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5 rounded-[10px]',
        md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
        lg: 'h-12 px-6 text-base gap-2.5 rounded-[10px]',
        icon: 'h-10 w-10 p-0 rounded-[10px]',
        'icon-sm': 'h-8 w-8 p-0 rounded-[10px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
