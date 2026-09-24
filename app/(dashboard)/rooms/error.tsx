'use client';

// app/(dashboard)/rooms/error.tsx — Rooms Module Error Boundary
import * as React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RoomsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-[12px]">
      <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Không thể tải danh sách phòng
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5">
        {error.message || 'Lỗi kết nối cơ sở dữ liệu phòng trọ. Vui lòng tải lại dữ liệu.'}
      </p>
      <Button onClick={() => reset()} variant="primary" size="sm">
        <RefreshCcw className="h-3.5 w-3.5" />
        <span>Thử lại ngay</span>
      </Button>
    </div>
  );
}
