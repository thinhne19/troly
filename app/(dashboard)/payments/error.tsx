'use client';

// app/(dashboard)/payments/error.tsx — Payments Error Boundary
import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Payments Error:', error);
  }, [error]);

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-white border border-rose-200 rounded-[16px] text-center shadow-xs">
      <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Lỗi khi tải dữ liệu sổ quỹ & thu chi
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {error.message || 'Đã xảy ra sự cố trong quá trình nạp danh sách giao dịch và đối soát VietQR. Vui lòng thử lại.'}
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} variant="primary" size="md">
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Thử tải lại</span>
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="outline" size="md">
          <span>Về trang chủ</span>
        </Button>
      </div>
    </div>
  );
}
