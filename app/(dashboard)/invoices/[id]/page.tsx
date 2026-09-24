'use client';

// app/(dashboard)/invoices/[id]/page.tsx — A4 Printable Invoice & Dynamic VietQR Receipt
import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  Share2,
  CheckCircle,
  Copy,
  Building2,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvoice } from '@/hooks/use-invoices';
import { useProperties } from '@/hooks/use-properties';
import {
  formatVND,
  formatDateVN,
  numberToVietnameseWords,
} from '@/lib/utils';
import { generateVietQrUrl } from '@/lib/vietqr';
import { ZaloReminderModal } from '@/components/zalo/zalo-reminder-modal';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params?.id as string;
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const [copied, setCopied] = React.useState(false);
  const [isZaloOpen, setIsZaloOpen] = React.useState(false);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Đang tải hóa đơn...</div>;
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Không tìm thấy thông tin hóa đơn này.</p>
        <Link href="/invoices">
          <Button variant="secondary">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const memoText = invoice.vietqrPayload || `TROLY ${invoice.room?.roomCode || ''} T${invoice.billingMonth.split('-')[1] || '09'}`;

  const vietQrUrl = generateVietQrUrl({
    bankId: 'MB',
    accountNo: '999908123456',
    accountName: 'NGUYEN VAN THIN',
    amount: invoice.balanceDue > 0 ? invoice.balanceDue : invoice.totalAmount,
    memo: memoText,
    template: 'compact2',
  });

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Ribbon (Hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/invoices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Quay lại</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button onClick={handleCopyMemo} variant="secondary" size="sm">
            <Copy className="h-4 w-4" />
            <span>{copied ? 'Đã sao chép cú pháp!' : 'Sao chép cú pháp CK'}</span>
          </Button>
          <Button
            onClick={() => setIsZaloOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-[#0068FF] border-blue-200 hover:bg-blue-50"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Gửi Zalo</span>
          </Button>
          <Button onClick={handlePrint} variant="primary" size="sm">
            <Printer className="h-4 w-4" />
            <span>In hóa đơn A4</span>
          </Button>
        </div>
      </div>

      {/* A4 Printable Invoice Sheet (Standard ISO 210x297mm styled container) */}
      <div className="bg-white border border-slate-200 rounded-[12px] p-8 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span>HỆ THỐNG PHÒNG TRỌ XANH</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 max-w-md">
              Địa chỉ: {invoice.property?.address || '128 Lê Văn Sỹ, Phường 10, Phú Nhuận, TP.HCM'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Hotline / Zalo chủ nhà: <span className="font-semibold text-slate-700">0908 123 456</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
              HÓA ĐƠN TIỀN NHÀ
            </h2>
            <div className="text-xs font-mono font-semibold text-indigo-700 mt-1">
              Số: {invoice.invoiceCode}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Kỳ thanh toán: <span className="font-semibold text-slate-700">{invoice.billingMonth}</span>
            </div>
            <div className="text-xs text-slate-400">
              Hạn nộp: <span className="font-bold text-rose-600">{formatDateVN(invoice.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Tenant Details Strip */}
        <div className="my-6 p-4 rounded-[10px] bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Khách thuê</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {invoice.tenant?.fullName || 'Khách thuê'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Số phòng</span>
            <span className="font-bold text-indigo-700 text-sm mt-0.5 block">
              {invoice.room?.roomCode}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Số điện thoại</span>
            <span className="font-medium text-slate-800 text-sm mt-0.5 block">
              {invoice.tenant?.phone || '---'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Trạng thái</span>
            <span className="mt-0.5 block">
              <Badge variant={invoice.paymentStatus === 'paid' ? 'success' : 'warning'} size="sm" dot>
                {invoice.paymentStatus === 'paid' ? 'Đã thu tiền' : 'Chưa thu'}
              </Badge>
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3 border-b border-slate-200">Khoản mục thu</th>
                <th className="p-3 border-b border-slate-200 text-center">Chỉ số cũ</th>
                <th className="p-3 border-b border-slate-200 text-center">Chỉ số mới</th>
                <th className="p-3 border-b border-slate-200 text-center">Số lượng</th>
                <th className="p-3 border-b border-slate-200 text-right">Đơn giá (₫)</th>
                <th className="p-3 border-b border-slate-200 text-right">Thành tiền (₫)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-slate-900">
                      {idx + 1}. {item.description}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-500 tabular-nums">
                      {item.previousReading ?? '--'}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-500 tabular-nums">
                      {item.currentReading ?? '--'}
                    </td>
                    <td className="p-3 text-center font-medium tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums">
                      {formatVND(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                      {formatVND(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    1. Tiền thuê phòng {invoice.room?.roomCode}
                  </td>
                  <td className="p-3 text-center text-slate-400">--</td>
                  <td className="p-3 text-center text-slate-400">--</td>
                  <td className="p-3 text-center font-medium">1 tháng</td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {formatVND(invoice.totalAmount)}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                    {formatVND(invoice.totalAmount)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-[10px] space-y-2 text-xs">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-700">TỔNG CỘNG TIỀN PHÒNG KỲ NÀY:</span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {formatVND(invoice.totalAmount)}
            </span>
          </div>
          <div className="text-slate-500 italic">
            (Bằng chữ: {numberToVietnameseWords(invoice.totalAmount)})
          </div>
          {invoice.amountPaid > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
              <span className="text-emerald-600 font-semibold">Đã thanh toán:</span>
              <span className="font-bold text-emerald-600 tabular-nums">
                - {formatVND(invoice.amountPaid)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
            <span className="font-bold text-rose-600">SỐ TIỀN CẦN THANH TOÁN CÒN LẠI:</span>
            <span className="text-lg font-bold text-rose-600 tabular-nums">
              {formatVND(invoice.balanceDue)}
            </span>
          </div>
        </div>

        {/* Napas 24/7 VietQR Payment Settlement Box */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-8 space-y-2 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              THÔNG TIN CHUYỂN KHOẢN TỰ ĐỘNG KHỚP LỆNH
            </div>
            <div className="space-y-1 text-slate-600">
              <div>Ngân hàng: <span className="font-semibold text-slate-900">MBBank (Quân Đội)</span></div>
              <div>Số tài khoản: <span className="font-mono font-bold text-indigo-700 text-sm">999908123456</span></div>
              <div>Chủ tài khoản: <span className="font-semibold text-slate-900">NGUYEN VAN THIN</span></div>
              <div>Cú pháp chuyển khoản: <span className="font-mono font-bold text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded">{memoText}</span></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              * Quý khách vui lòng quét mã VietQR bên cạnh để ứng dụng ngân hàng tự động điền đúng số tiền và nội dung, giúp hệ thống ghi nhận gạch nợ sau 30 giây.
            </p>
          </div>

          <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-[12px]">
            <img
              src={vietQrUrl}
              alt="Mã VietQR thanh toán"
              className="w-44 h-auto rounded-[8px] border border-slate-200 shadow-xs"
            />
            <span className="text-[10px] font-semibold text-slate-500 mt-2">
              VietQR • Napas 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Zalo Reminder Modal */}
      {invoice && (
        <ZaloReminderModal
          isOpen={isZaloOpen}
          onClose={() => setIsZaloOpen(false)}
          invoice={invoice}
          initialTemplate={invoice.paymentStatus === 'overdue' ? 'debt_reminder' : 'new_invoice'}
        />
      )}
    </div>
  );
}
