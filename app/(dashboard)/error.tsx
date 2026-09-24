'use client';

// app/(dashboard)/error.tsx — Dashboard Error Boundary
import * as React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-xs">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1.5">
        Đã có lỗi xảy ra khi tải dữ liệu
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        {error.message || 'Không thể đồng bộ trạng thái hệ thống. Vui lòng thử lại hoặc tải lại trang.'}
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} variant="primary" size="md">
          <RefreshCcw className="h-4 w-4" />
          <span>Thử lại</span>
        </Button>
        <Link href="/">
          <Button variant="secondary" size="md">
            <Home className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
