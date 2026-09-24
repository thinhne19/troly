// app/(dashboard)/payments/not-found.tsx — Payments Not Found Boundary
import Link from 'next/link';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsNotFound() {
  return (
    <div className="min-h-[450px] flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-[16px] text-center shadow-xs">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
        <CreditCard className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Không tìm thấy thông tin thanh toán
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        Giao dịch hoặc sổ thu chi bạn yêu cầu không tồn tại hoặc đã được chuyển vào lưu trữ.
      </p>
      <Link href="/payments">
        <Button variant="primary" size="md">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Về sổ quỹ</span>
        </Button>
      </Link>
    </div>
  );
}
