// app/(dashboard)/rooms/loading.tsx — Rooms Module Skeleton Loader
import * as React from 'react';

export default function RoomsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-[8px]" />
          <div className="h-4 w-64 bg-slate-100 rounded-[6px]" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-[10px]" />
      </div>

      <div className="h-12 bg-white border border-slate-200 rounded-[12px] p-3 flex justify-between">
        <div className="h-6 w-56 bg-slate-200 rounded-[6px]" />
        <div className="h-6 w-48 bg-slate-100 rounded-[6px]" />
      </div>

      <div className="bg-white border border-slate-200 rounded-[12px] p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-[8px] flex items-center px-4 justify-between">
            <div className="h-4 w-20 bg-slate-200 rounded-[4px]" />
            <div className="h-4 w-32 bg-slate-200 rounded-[4px]" />
            <div className="h-4 w-20 bg-slate-200 rounded-[4px]" />
            <div className="h-4 w-24 bg-slate-200 rounded-[4px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
