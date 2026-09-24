// app/(dashboard)/invoices/not-found.tsx
import * as React from 'react';
import Link from 'next/link';
import { ReceiptText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvoicesNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-[12px]">
      <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        <ReceiptText className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Hóa đơn không tồn tại
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5">
        Mã hóa đơn bạn tìm kiếm không có trong danh sách hoặc đã bị xóa.
      </p>
      <Link href="/invoices">
        <Button variant="primary" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Về danh sách hóa đơn</span>
        </Button>
      </Link>
    </div>
  );
}
