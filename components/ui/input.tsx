'use client';

// components/ui/input.tsx — Troly Master Spec v1.0 Input Component (10px Radius)
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingAdornment?: React.ReactNode;
  isNumericTabular?: boolean;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      leadingIcon,
      trailingAdornment,
      isNumericTabular = false,
      error,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center w-full">
          {leadingIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leadingIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-[10px] border bg-white px-3 py-2 text-sm text-slate-900 shadow-none transition-colors',
              error
                ? 'border-rose-500 focus-visible:border-rose-600 focus-visible:ring-rose-500'
                : 'border-slate-200 focus-visible:border-indigo-600 focus-visible:ring-indigo-600',
              'placeholder:text-slate-400',
              'focus-visible:outline-none focus-visible:ring-1',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
              leadingIcon && 'pl-9',
              trailingAdornment && 'pr-12',
              isNumericTabular && 'tabular-nums font-mono',
              className
            )}
            {...props}
          />
          {trailingAdornment && (
            <div className="absolute right-3 flex items-center pointer-events-none text-xs font-semibold text-slate-500">
              {trailingAdornment}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

