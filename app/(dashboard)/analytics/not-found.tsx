// app/(dashboard)/analytics/not-found.tsx — Analytics Not Found Boundary
import Link from 'next/link';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyticsNotFound() {
  return (
    <div className="min-h-[450px] flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-[16px] text-center shadow-xs">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
        <BarChart3 className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Không tìm thấy dữ liệu báo cáo
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        Báo cáo hoặc biểu đồ phân tích bạn yêu cầu không tồn tại hoặc cơ sở chưa có giao dịch nào phát sinh.
      </p>
      <Link href="/analytics">
        <Button variant="primary" size="md">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Về trang báo cáo</span>
        </Button>
      </Link>
    </div>
  );
}
