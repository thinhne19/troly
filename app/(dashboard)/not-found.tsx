// app/(dashboard)/not-found.tsx — Dashboard Not Found View
import * as React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-4 border border-slate-200">
        <FileQuestion className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1.5">
        Không tìm thấy trang hoặc dữ liệu
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        Nội dung hoặc phòng bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi.
      </p>
      <Link href="/">
        <Button variant="primary" size="md">
          <Home className="h-4 w-4" />
          <span>Về bảng điều khiển</span>
        </Button>
      </Link>
    </div>
  );
}
