'use client';

// app/(dashboard)/invoices/page.tsx — Invoice Engine & Invoices Management
import * as React from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  CheckCircle,
  Printer,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Trash2,
  AlertTriangle,
  FileText,
  DollarSign,
  Send,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import {
  useInvoices,
  useGenerateInvoices,
  useDeleteInvoice,
} from '@/hooks/use-invoices';
import { usePropertyStore } from '@/stores/use-property-store';
import { formatVND, formatDateVN } from '@/lib/utils';
import { Invoice } from '@/types/models';
import { ZaloReminderModal, ZaloTemplateType } from '@/components/zalo/zalo-reminder-modal';
import { exportMonthlyRevenueCsv } from '@/lib/export-excel';

export default function InvoicesPage() {
  const { selectedPropertyId, selectedMonth, setSelectedMonth } = usePropertyStore();
  const { data: invoices, isLoading } = useInvoices(selectedPropertyId, selectedMonth);

  const generateInvoicesMutation = useGenerateInvoices();
  const deleteInvoiceMutation = useDeleteInvoice();

  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [deletingInvoice, setDeletingInvoice] = React.useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Zalo Reminder State
  const [zaloTargetInvoice, setZaloTargetInvoice] = React.useState<Invoice | null>(null);
  const [zaloTemplate, setZaloTemplate] = React.useState<ZaloTemplateType>('new_invoice');
  const [isZaloOpen, setIsZaloOpen] = React.useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  // Bulk generate invoices handler
  const handleBulkGenerate = async () => {
    await generateInvoicesMutation.mutateAsync({
      propertyId: selectedPropertyId,
      month: selectedMonth,
    });
    setToastMessage(`Đã sinh hóa đơn thành công cho toàn bộ phòng kỳ ${selectedMonth}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Delete invoice handler
  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;
    await deleteInvoiceMutation.mutateAsync(deletingInvoice.id);
    setDeletingInvoice(null);
    setToastMessage(`Đã xóa hóa đơn ${deletingInvoice.invoiceCode}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPI Calculations
  const totalBills = invoices?.length || 0;
  const unpaidBills = invoices?.filter((i) => i.paymentStatus === 'unpaid').length || 0;
  const paidBills = invoices?.filter((i) => i.paymentStatus === 'paid').length || 0;
  const overdueBills = invoices?.filter((i) => i.paymentStatus === 'overdue').length || 0;

  const totalAmount = invoices?.reduce((acc, i) => acc + (i.totalAmount || 0), 0) || 0;
  const totalCollected = invoices?.reduce((acc, i) => acc + (i.amountPaid || 0), 0) || 0;
  const totalPending = Math.max(0, totalAmount - totalCollected);

  // Filtered invoices
  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];
    return invoices.filter((inv) => {
      if (activeTab === 'unpaid' && inv.paymentStatus === 'paid') return false;
      if (activeTab === 'paid' && inv.paymentStatus !== 'paid') return false;
      if (activeTab === 'overdue' && inv.paymentStatus !== 'overdue') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchCode = inv.invoiceCode.toLowerCase().includes(q);
        const matchRoom = inv.room?.roomCode.toLowerCase().includes(q);
        const matchTenant = inv.tenant?.fullName.toLowerCase().includes(q);
        return matchCode || matchRoom || matchTenant;
      }
      return true;
    });
  }, [invoices, activeTab, searchQuery]);

  const columns: Column<Invoice>[] = [
    {
      header: 'Mã hóa đơn',
      accessorKey: 'invoiceCode',
      cell: (row) => (
        <Link
          href={`/invoices/${row.id}`}
          className="font-bold text-indigo-600 hover:underline flex items-center gap-1.5"
        >
          <span>{row.invoiceCode}</span>
        </Link>
      ),
    },
    {
      header: 'Phòng',
      cell: (row) => (
        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-[6px] text-xs">
          {row.room?.roomCode || '---'}
        </span>
      ),
    },
    {
      header: 'Khách thuê',
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900 text-xs sm:text-sm">
            {row.tenant?.fullName || 'Khách thuê'}
          </div>
          <div className="text-[11px] text-slate-400">{row.tenant?.phone || ''}</div>
        </div>
      ),
    },
    {
      header: 'Tổng tiền bill',
      align: 'right',
      accessorKey: 'totalAmount',
      cell: (row) => (
        <span className="font-bold text-slate-900 tabular-nums">
          {formatVND(row.totalAmount)}
        </span>
      ),
    },
    {
      header: 'Đã thanh toán',
      align: 'right',
      accessorKey: 'amountPaid',
      cell: (row) => (
        <span className="font-medium text-emerald-600 tabular-nums text-xs">
          {formatVND(row.amountPaid)}
        </span>
      ),
    },
    {
      header: 'Còn lại',
      align: 'right',
      accessorKey: 'balanceDue',
      cell: (row) => (
        <span
          className={`font-bold tabular-nums text-xs ${
            row.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'
          }`}
        >
          {formatVND(row.balanceDue)}
        </span>
      ),
    },
    {
      header: 'Hạn nộp',
      align: 'center',
      cell: (row) => (
        <span className="text-xs text-slate-600 tabular-nums">
          {formatDateVN(row.dueDate)}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      accessorKey: 'paymentStatus',
      align: 'center',
      cell: (row) => {
        const badgeMap = {
          paid: { label: 'Đã hoàn tất', variant: 'success' as const, dot: true },
          unpaid: { label: 'Chưa thanh toán', variant: 'warning' as const, dot: true },
          partially_paid: { label: 'Thu 1 phần', variant: 'info' as const, dot: true },
          overdue: { label: 'Quá hạn', variant: 'error' as const, dot: true },
        }[row.paymentStatus];

        return (
          <Badge variant={badgeMap.variant} dot={badgeMap.dot} size="sm">
            {badgeMap.label}
          </Badge>
        );
      },
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (row) => {
        const zaloMessage = encodeURIComponent(
          `Chào ${row.tenant?.fullName || 'bạn'}, gửi bạn thông báo tiền phòng ${row.room?.roomCode || ''} kỳ ${row.billingMonth}: Tổng số tiền là ${formatVND(row.balanceDue)}. Hạn đóng trước ngày ${formatDateVN(row.dueDate)}. Bạn kiểm tra và chuyển khoản theo mã VietQR nhé. Cảm ơn bạn!`
        );

        return (
          <div className="flex items-center justify-end gap-1">
            <Link href={`/invoices/${row.id}`}>
              <Button variant="ghost" size="sm" title="In phiếu thu / Xem VietQR">
                <Printer className="h-3.5 w-3.5 text-slate-600" />
                <span>Chi tiết</span>
              </Button>
            </Link>
            {row.tenant?.phone && (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Gửi Zalo nhắc nợ / Thông báo"
                onClick={() => {
                  setZaloTargetInvoice(row);
                  setZaloTemplate(row.paymentStatus === 'overdue' ? 'debt_reminder' : 'new_invoice');
                  setIsZaloOpen(true);
                }}
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#0068FF]" />
              </Button>
            )}
            <Button
              onClick={() => setDeletingInvoice(row)}
              variant="ghost"
              size="icon-sm"
              title="Xóa hóa đơn"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Month Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Hóa đơn tiền phòng</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
              Kỳ {selectedMonth}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tự động tổng hợp tiền thuê phòng, điện nước và phí cố định từ chỉ số đồng hồ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded-[10px] p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-[6px] text-slate-600 transition-colors"
              title="Kỳ trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 tabular-nums">
              {selectedMonth}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-[6px] text-slate-600 transition-colors"
              title="Kỳ sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={() => {
              exportMonthlyRevenueCsv(invoices || [], selectedPropertyId, selectedMonth);
              setToastMessage('Đã xuất file Excel doanh thu tháng thành công');
            }}
            variant="secondary"
            size="md"
            className="gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </Button>

          <Button
            onClick={handleBulkGenerate}
            variant="primary"
            size="md"
            isLoading={generateInvoicesMutation.isPending}
            className="shadow-sm"
          >
            <FileCheck className="h-4 w-4" />
            <span>Sinh hóa đơn hàng loạt</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[12px] flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in shadow-xs">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tổng tiền hóa đơn
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {formatVND(totalAmount)}
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Đã thu thực tế
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {formatVND(totalCollected)}
          </div>
        </div>

        <div className="bg-white border border-rose-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
            Chưa thu / Còn nợ
          </span>
          <div className="text-xl font-bold text-rose-700 mt-1 tabular-nums">
            {formatVND(totalPending)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tổng số hóa đơn
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalBills} bill
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-[12px] border border-slate-200">
        <Tabs
          tabs={[
            { id: 'all', label: 'Tất cả hóa đơn', count: totalBills },
            { id: 'unpaid', label: 'Chưa thanh toán', count: unpaidBills },
            { id: 'paid', label: 'Đã hoàn tất', count: paidBills },
            { id: 'overdue', label: 'Quá hạn', count: overdueBills },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã bill, phòng, tên..."
            leadingIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Invoices Data Table */}
      <DataTable
        columns={columns}
        data={filteredInvoices}
        keyExtractor={(i) => i.id}
        isLoading={isLoading}
      />

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deletingInvoice)}
        onClose={() => setDeletingInvoice(null)}
        title="Xóa hóa đơn"
        description={`Bạn có chắc chắn muốn xóa hóa đơn ${deletingInvoice?.invoiceCode}?`}
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-[10px] text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              Hóa đơn của phòng <strong>{deletingInvoice?.room?.roomCode}</strong> (
              {formatVND(deletingInvoice?.totalAmount)}) sẽ bị xóa vĩnh viễn. Bạn có thể sinh lại hóa đơn này sau nếu cần.
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingInvoice(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleteInvoiceMutation.isPending}
            >
              Xác nhận xóa hóa đơn
            </Button>
          </div>
        </div>
      </Modal>

      {/* Zalo Reminder Modal */}
      {zaloTargetInvoice && (
        <ZaloReminderModal
          isOpen={isZaloOpen}
          onClose={() => {
            setIsZaloOpen(false);
            setZaloTargetInvoice(null);
          }}
          invoice={zaloTargetInvoice}
          initialTemplate={zaloTemplate}
        />
      )}
    </div>
  );
}
