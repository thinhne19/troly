// app/(dashboard)/rooms/not-found.tsx
import * as React from 'react';
import Link from 'next/link';
import { DoorClosed, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RoomsNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-[12px]">
      <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        <DoorClosed className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Phòng không tồn tại
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5">
        Mã phòng bạn tìm kiếm không có trong cơ sở dữ liệu hoặc đã bị xóa.
      </p>
      <Link href="/rooms">
        <Button variant="primary" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Về danh sách phòng</span>
        </Button>
      </Link>
    </div>
  );
}
