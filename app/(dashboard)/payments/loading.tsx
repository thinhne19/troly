// app/(dashboard)/payments/loading.tsx — Payments Module Skeleton Loading State
export default function PaymentsLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-[8px]" />
          <div className="h-4 w-96 bg-slate-100 rounded-[6px]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-36 bg-slate-200 rounded-[8px]" />
          <div className="h-9 w-32 bg-slate-200 rounded-[8px]" />
        </div>
      </div>

      {/* KPI Stats Bar Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-[12px] p-5 space-y-3 shadow-xs">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-7 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-44 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table Skeleton */}
      <div className="bg-white border border-slate-200 rounded-[12px] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="h-9 w-60 bg-slate-200 rounded-[8px]" />
          <div className="h-9 w-48 bg-slate-200 rounded-[8px]" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="h-12 w-full bg-slate-100 rounded-[6px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
