// app/(dashboard)/leases/not-found.tsx
import * as React from 'react';
import Link from 'next/link';
import { FileX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LeasesNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-[12px]">
      <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        <FileX className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Hợp đồng không tồn tại
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5">
        Mã hợp đồng thuê phòng bạn tìm kiếm không có trong danh sách hoặc đã bị hủy.
      </p>
      <Link href="/leases">
        <Button variant="primary" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Về danh sách hợp đồng</span>
        </Button>
      </Link>
    </div>
  );
}
