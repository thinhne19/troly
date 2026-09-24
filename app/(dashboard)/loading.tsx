// app/(dashboard)/loading.tsx — Dashboard Root Skeleton Loader
import * as React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 rounded-[8px]" />
          <div className="h-4 w-72 bg-slate-100 rounded-[6px]" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-slate-200 rounded-[10px]" />
          <div className="h-10 w-40 bg-indigo-200 rounded-[10px]" />
        </div>
      </div>

      {/* 4 KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-white border border-slate-200 rounded-[12px] p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-slate-200 rounded-[6px]" />
              <div className="h-8 w-8 bg-slate-100 rounded-[8px]" />
            </div>
            <div className="h-7 w-36 bg-slate-200 rounded-[6px]" />
            <div className="h-3 w-24 bg-slate-100 rounded-[4px]" />
          </div>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white border border-slate-200 rounded-[12px] p-5">
          <div className="h-5 w-48 bg-slate-200 rounded-[6px] mb-4" />
          <div className="h-60 bg-slate-100 rounded-[8px]" />
        </div>
        <div className="h-80 bg-white border border-slate-200 rounded-[12px] p-5">
          <div className="h-5 w-36 bg-slate-200 rounded-[6px] mb-4" />
          <div className="h-60 bg-slate-100 rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}
