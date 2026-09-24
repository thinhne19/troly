// app/(dashboard)/analytics/loading.tsx — Analytics Loading Skeleton
export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-[8px]" />
          <div className="h-4 w-96 bg-slate-100 rounded-[6px]" />
        </div>
        <div className="h-9 w-44 bg-slate-200 rounded-[8px]" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-[12px] p-5 space-y-3 shadow-xs">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-7 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-48 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-white border border-slate-200 rounded-[12px] p-5 shadow-xs" />
        <div className="h-80 bg-white border border-slate-200 rounded-[12px] p-5 shadow-xs" />
      </div>

      {/* Debt Waterfall Skeleton */}
      <div className="h-64 bg-white border border-slate-200 rounded-[12px] p-5 shadow-xs" />
    </div>
  );
}
