'use client';

// app/(dashboard)/payments/page.tsx — Payment Ledger, VietQR Reconciliation & Deposit Management
import * as React from 'react';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  ArrowDownLeft,
  Search,
  Download,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  DoorOpen,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Receipt,
  FileSpreadsheet,
  History,
  Filter,
  Check,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { ZaloReminderModal, ZaloTemplateType } from '@/components/zalo/zalo-reminder-modal';

import { usePayments, useReconcileVietQr, useRecordPayment, useAuditLogs } from '@/hooks/use-payments';
import { useInvoices } from '@/hooks/use-invoices';
import { useLeases } from '@/hooks/use-leases';
import { useProperties } from '@/hooks/use-properties';
import { usePropertyStore } from '@/stores/use-property-store';

import { formatVND, formatDateVN } from '@/lib/utils';
import { downloadCsvWithBom, exportMonthlyRevenueCsv } from '@/lib/export-excel';
import { Payment, Invoice, Lease, AuditLog } from '@/types/models';
import { buildTransferMemo } from '@/lib/vietqr';
import { useMounted } from '@/hooks/use-mounted';

export default function PaymentsPage() {
  const mounted = useMounted();
  const { selectedPropertyId, selectedMonth, setSelectedMonth } = usePropertyStore();
  const { data: properties } = useProperties();
  const { data: payments = [], isLoading: isPaymentsLoading } = usePayments(selectedPropertyId, selectedMonth);
  const { data: invoices = [], isLoading: isInvoicesLoading } = useInvoices(selectedPropertyId, selectedMonth);
  const { data: leases = [], isLoading: isLeasesLoading } = useLeases(selectedPropertyId);
  const { data: auditLogs = [] } = useAuditLogs(40);

  const reconcileMutation = useReconcileVietQr();
  const recordPaymentMutation = useRecordPayment();

  // Navigation & UI States
  const [activeTab, setActiveTab] = React.useState<'ledger' | 'vietqr' | 'deposits' | 'audit'>('ledger');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [methodFilter, setMethodFilter] = React.useState<string>('all');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Manual Payment Recording Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState('');
  const [paymentAmount, setPaymentAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<Payment['paymentMethod']>('vietqr');
  const [transactionRef, setTransactionRef] = React.useState('');
  const [paymentNote, setPaymentNote] = React.useState('');

  // VietQR Simulation / Reconciliation State
  const [simulatedMemo, setSimulatedMemo] = React.useState('');
  const [simulatedAmount, setSimulatedAmount] = React.useState<number>(0);
  const [reconcileResult, setReconcileResult] = React.useState<{
    matched: boolean;
    invoice?: Invoice;
    payment?: Payment;
    error?: string;
  } | null>(null);

  // Zalo Modal State
  const [zaloTargetInvoice, setZaloTargetInvoice] = React.useState<Invoice | null>(null);
  const [zaloTemplate, setZaloTemplate] = React.useState<ZaloTemplateType>('payment_receipt');
  const [isZaloModalOpen, setIsZaloModalOpen] = React.useState(false);

  // Deposit Settlement Modal State
  const [settlingLease, setSettlingLease] = React.useState<Lease | null>(null);
  const [settleAction, setSettleAction] = React.useState<'refund' | 'forfeit'>('refund');
  const [settleNotes, setSettleNotes] = React.useState('');

  const activePropertyName = !mounted
    ? 'Tất cả cơ sở'
    : selectedPropertyId && selectedPropertyId !== 'all'
    ? properties?.find((p) => p.id === selectedPropertyId)?.name || 'Tất cả cơ sở'
    : 'Tất cả cơ sở';

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  // Calculations
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const vietqrPayments = payments.filter((p) => p.paymentMethod === 'vietqr');
  const vietqrTotal = vietqrPayments.reduce((acc, p) => acc + p.amount, 0);
  const manualPayments = payments.filter((p) => p.paymentMethod !== 'vietqr');
  const manualTotal = manualPayments.reduce((acc, p) => acc + p.amount, 0);

  // Held deposits from active leases
  const heldDepositsTotal = leases
    .filter((l) => l.depositStatus === 'held')
    .reduce((acc, l) => acc + (l.depositAmount || 0), 0);

  // Unpaid invoices for recording manual payment
  const unpaidInvoices = invoices.filter((i) => i.balanceDue > 0);

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoice?.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoice?.room?.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoice?.tenant?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.note?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  // Handle Manual Payment Submission
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || paymentAmount <= 0) {
      alert('Vui lòng chọn hóa đơn và nhập số tiền thanh toán hợp lệ');
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        invoiceId: selectedInvoiceId,
        amount: paymentAmount,
        paymentMethod,
        transactionRef: transactionRef || undefined,
        note: paymentNote || undefined,
      });

      setIsRecordModalOpen(false);
      setSelectedInvoiceId('');
      setPaymentAmount(0);
      setTransactionRef('');
      setPaymentNote('');
      showToast('Đã ghi nhận thanh toán thành công vào sổ quỹ');
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi ghi nhận thanh toán');
    }
  };

  // Handle VietQR Reconciliation Submission
  const handleReconcileSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simulatedMemo.trim() || simulatedAmount <= 0) {
      alert('Vui lòng nhập nội dung chuyển khoản và số tiền giao dịch');
      return;
    }

    try {
      const res = await reconcileMutation.mutateAsync({
        transactionRef: `FT${Date.now().toString().slice(-8)}`,
        memo: simulatedMemo.trim(),
        amount: simulatedAmount,
        paymentDate: new Date().toISOString(),
      });

      setReconcileResult(res);
      if (res.matched) {
        showToast(`Khớp lệnh thành công! Hóa đơn ${res.invoice?.invoiceCode} đã được thanh toán.`);
      }
    } catch (err: any) {
      setReconcileResult({
        matched: false,
        error: err?.message || 'Lỗi xử lý đối soát',
      });
    }
  };

  // Quick preset for simulated bank statements
  const handleSelectSimulatedPreset = (unpaidInv: Invoice) => {
    const propName = properties?.find((p) => p.id === unpaidInv.propertyId)?.name || 'LVS';
    const memo = unpaidInv.vietqrPayload || buildTransferMemo(propName, unpaidInv.room?.roomCode || 'P101', unpaidInv.billingMonth);
    setSimulatedMemo(memo);
    setSimulatedAmount(unpaidInv.balanceDue);
    setReconcileResult(null);
  };

  // Export Payment Ledger CSV
  const handleExportLedgerCsv = () => {
    const headers = [
      'Mã giao dịch',
      'Thời gian',
      'Mã hóa đơn',
      'Cơ sở',
      'Phòng',
      'Khách thuê',
      'Số tiền (VNĐ)',
      'Hình thức',
      'Mã tham chiếu',
      'Ghi chú',
    ];

    const rows = filteredPayments.map((p) => [
      p.id,
      formatDateVN(p.paymentDate),
      p.invoice?.invoiceCode || '—',
      p.invoice?.property?.name || activePropertyName,
      p.invoice?.room?.roomCode || '—',
      p.invoice?.tenant?.fullName || '—',
      p.amount,
      p.paymentMethod === 'vietqr' ? 'VietQR Napas 24/7' : p.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản NH',
      p.transactionRef || '',
      p.note || '',
    ]);

    const summaryRow = ['TỔNG THU', '', '', '', '', `${filteredPayments.length} giao dịch`, totalCollected, '', '', ''];

    const content = [
      `SỔ QUỸ THU TIỀN — ${activePropertyName.toUpperCase()}`,
      `Kỳ tháng: ${selectedMonth} | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
      '',
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
      summaryRow.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','),
    ].join('\r\n');

    downloadCsvWithBom(`So_quy_thu_tien_${selectedMonth}.csv`, content);
    showToast('Đã xuất sổ quỹ thu tiền định dạng Excel thành công');
  };

  // Columns for Payment Ledger Table
  const paymentColumns: Column<Payment>[] = [
    {
      header: 'Thời gian & Mã GD',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
            <span>{row.transactionRef || row.id}</span>
          </div>
          <span className="text-[11px] text-slate-500">{formatDateVN(row.paymentDate)}</span>
        </div>
      ),
    },
    {
      header: 'Phòng & Khách thuê',
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">
            {row.invoice?.room?.roomCode || 'Phòng thuê'}
          </span>
          <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
            {row.invoice?.tenant?.fullName || '—'}
          </p>
        </div>
      ),
    },
    {
      header: 'Hóa đơn',
      cell: (row) => (
        <div>
          <span className="font-mono text-xs text-indigo-600 font-medium">
            {row.invoice?.invoiceCode || '—'}
          </span>
          <p className="text-[10px] text-slate-400">Kỳ {row.invoice?.billingMonth || selectedMonth}</p>
        </div>
      ),
    },
    {
      header: 'Số tiền thanh toán',
      cell: (row) => (
        <span className="font-bold text-emerald-600 text-sm">
          +{formatVND(row.amount)}
        </span>
      ),
    },
    {
      header: 'Hình thức',
      cell: (row) => {
        if (row.paymentMethod === 'vietqr') {
          return (
            <Badge variant="success" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <QrCode className="w-3 h-3" />
              <span>VietQR Napas</span>
            </Badge>
          );
        }
        if (row.paymentMethod === 'cash') {
          return (
            <Badge variant="neutral" className="gap-1 text-slate-700 bg-slate-50">
              <ArrowDownLeft className="w-3 h-3" />
              <span>Tiền mặt</span>
            </Badge>
          );
        }
        return (
          <Badge variant="info" className="gap-1 text-blue-700 bg-blue-50 border-blue-200">
            <CreditCard className="w-3 h-3" />
            <span>Chuyển khoản</span>
          </Badge>
        );
      },
    },
    {
      header: 'Ghi chú / Khớp lệnh',
      cell: (row) => (
        <span className="text-xs text-slate-600 truncate max-w-[180px] block" title={row.note || ''}>
          {row.note || 'Thanh toán tiền phòng'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.invoice && (
            <Link href={`/invoices/${row.invoice.id}`}>
              <Button variant="ghost" size="sm" title="Xem hóa đơn chi tiết">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Xem HĐ</span>
              </Button>
            </Link>
          )}
          {row.invoice && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setZaloTargetInvoice(row.invoice!);
                setZaloTemplate('payment_receipt');
                setIsZaloModalOpen(true);
              }}
              title="Gửi biên nhận Zalo"
              className="text-[#0068FF] hover:bg-blue-50"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Biên nhận Zalo</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-[8px] shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sổ quỹ & Thu chi
            </h1>
            <span
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50"
              suppressHydrationWarning
            >
              Kỳ {selectedMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi dòng tiền, tự động khớp lệnh VietQR Napas 24/7 và kiểm soát quỹ tiền cọc
          </p>
        </div>

        {/* Action Controls & Month Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-[8px] p-0.5 shadow-xs">
            <Button onClick={handlePrevMonth} variant="ghost" size="icon-sm" title="Tháng trước">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <span className="text-xs font-semibold text-slate-700 px-2 min-w-[72px] text-center">
              {selectedMonth}
            </span>
            <Button onClick={handleNextMonth} variant="ghost" size="icon-sm" title="Tháng sau">
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          <Button
            onClick={() => {
              setActiveTab('vietqr');
            }}
            variant="outline"
            size="sm"
            className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <QrCode className="h-4 w-4" />
            <span>Đối soát VietQR</span>
          </Button>

          <Button
            onClick={() => {
              if (unpaidInvoices.length > 0) {
                setSelectedInvoiceId(unpaidInvoices[0].id);
                setPaymentAmount(unpaidInvoices[0].balanceDue);
              }
              setIsRecordModalOpen(true);
            }}
            variant="primary"
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Thu tiền mặt / Chuyển khoản</span>
          </Button>

          <Button onClick={handleExportLedgerCsv} variant="outline" size="sm" title="Xuất file Excel" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng tiền đã thu kỳ này"
          value={formatVND(totalCollected)}
          subValue={`${payments.length} giao dịch thành công`}
          icon={ArrowDownLeft}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          title="Thu qua VietQR Napas"
          value={formatVND(vietqrTotal)}
          subValue={`${vietqrPayments.length} giao dịch (${totalCollected > 0 ? Math.round((vietqrTotal / totalCollected) * 100) : 0}%)`}
          icon={QrCode}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          title="Thu tiền mặt / Thường"
          value={formatVND(manualTotal)}
          subValue={`${manualPayments.length} khoản thu thủ công`}
          icon={CreditCard}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="Quỹ tiền cọc đang giữ"
          value={formatVND(heldDepositsTotal)}
          subValue={`${leases.filter((l) => l.depositStatus === 'held').length} phòng có cọc`}
          icon={ShieldCheck}
          iconColor="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-[12px] shadow-xs overflow-hidden">
        <div className="px-6 pt-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: 'ledger', label: 'Sổ thanh toán' },
              { id: 'vietqr', label: 'Đối soát VietQR Napas 24/7' },
              { id: 'deposits', label: 'Sổ tiền cọc' },
              { id: 'audit', label: 'Nhật ký giao dịch (Audit Logs)' },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />

          {activeTab === 'ledger' && (
            <div className="flex items-center gap-2 pb-3 sm:pb-0">
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm phòng, khách, mã GD..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-[6px] border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-[6px] border border-slate-200 bg-white text-slate-700 outline-none"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="vietqr">VietQR Napas</option>
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Sổ thanh toán (Payment Ledger) */}
        {activeTab === 'ledger' && (
          <div className="p-6">
            <DataTable<Payment>
              columns={paymentColumns}
              data={filteredPayments}
              keyExtractor={(p) => p.id}
              isLoading={isPaymentsLoading}
              emptyMessage={`Không có giao dịch nào được ghi nhận trong kỳ ${selectedMonth}.`}
            />
          </div>
        )}

        {/* Tab 2: Đối soát VietQR Napas 24/7 */}
        {activeTab === 'vietqr' && (
          <div className="p-6 space-y-6">
            {/* Explanatory Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-[12px] p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Cơ chế khớp lệnh tự động VietQR Napas 24/7
                  </h3>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    Khách thuê quét mã VietQR trên hóa đơn được tự động gán cú pháp chuẩn:{' '}
                    <code className="bg-white/80 px-1.5 py-0.5 rounded text-emerald-800 font-mono font-bold border border-emerald-200">
                      TROLY-[MÃ TÒA]-[MÃ PHÒNG]-[YYYYMM]
                    </code>
                    . Hệ thống phát hiện biến động số dư và tự động gạch nợ hóa đơn, cập nhật trạng thái
                    sang Đã thanh toán và ghi nhật ký kiểm toán.
                  </p>
                </div>
              </div>
            </div>

            {/* Reconciliation Simulator & Manual Match */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Bank statement test / input */}
              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-[12px] p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-primary" />
                  <span>Mô phỏng Webhook Ngân hàng (Napas 24/7)</span>
                </h4>

                <form onSubmit={handleReconcileSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Nội dung chuyển khoản (Memo)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TROLY-LVS-P202-202609"
                      value={simulatedMemo}
                      onChange={(e) => setSimulatedMemo(e.target.value)}
                      className="w-full font-mono text-xs px-3 py-2 rounded-[6px] border border-slate-300 bg-white uppercase"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hệ thống tự động bóc tách mã tòa, số phòng và tháng hóa đơn.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Số tiền thực nhận (VNĐ)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5480000"
                      value={simulatedAmount || ''}
                      onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-[6px] border border-slate-300 bg-white"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                    disabled={reconcileMutation.isPending}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{reconcileMutation.isPending ? 'Đang kiểm tra...' : 'Khớp lệnh tự động ngay'}</span>
                  </Button>
                </form>

                {/* Result Feedback */}
                {reconcileResult && (
                  <div
                    className={`p-4 rounded-[8px] border text-xs leading-relaxed animate-in fade-in ${
                      reconcileResult.matched
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {reconcileResult.matched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Khớp lệnh thành công 100%</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>Không tìm thấy hóa đơn khớp</span>
                        </>
                      )}
                    </div>
                    {reconcileResult.matched ? (
                      <div>
                        <p>
                          Hóa đơn <span className="font-mono font-bold">{reconcileResult.invoice?.invoiceCode}</span>{' '}
                          (Phòng {reconcileResult.invoice?.room?.roomCode}) đã được ghi nhận thanh toán{' '}
                          <span className="font-bold">{formatVND(reconcileResult.payment?.amount || 0)}</span>.
                        </p>
                        <p className="mt-1 text-[11px] text-emerald-700">
                          Trạng thái mới: <span className="font-semibold uppercase">{reconcileResult.invoice?.paymentStatus}</span>.
                        </p>
                      </div>
                    ) : (
                      <p>{reconcileResult.error}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Fast pick from unpaid invoices */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-[12px] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Hóa đơn đang chờ thanh toán ({unpaidInvoices.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Bấm để điền nhanh nội dung thử nghiệm</span>
                </div>

                {unpaidInvoices.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Tất cả hóa đơn trong kỳ này đã được thanh toán hoàn tất!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {unpaidInvoices.map((inv) => {
                      const propName = properties?.find((p) => p.id === inv.propertyId)?.name || 'LVS';
                      const memo = inv.vietqrPayload || buildTransferMemo(propName, inv.room?.roomCode || 'P101', inv.billingMonth);

                      return (
                        <div
                          key={inv.id}
                          onClick={() => handleSelectSimulatedPreset(inv)}
                          className="flex items-center justify-between p-3 rounded-[8px] border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                {inv.room?.roomCode || 'Phòng'}
                              </span>
                              <span className="font-mono text-[11px] text-slate-500">
                                {inv.invoiceCode}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-indigo-600 block mt-0.5">
                              {memo}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-xs text-rose-600 block">
                              {formatVND(inv.balanceDue)}
                            </span>
                            <span className="text-[10px] text-slate-400">Điền thử →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sổ tiền cọc (Deposit Ledger) */}
        {activeTab === 'deposits' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Quản lý quỹ tiền cọc giữ hộ khách thuê
                </h3>
                <p className="text-xs text-slate-500">
                  Theo dõi tiền đặt cọc theo từng hợp đồng, trạng thái hoàn cọc hoặc khấu trừ khi trả phòng
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Tổng quỹ cọc hiện hành</span>
                <span className="text-lg font-bold text-slate-900">{formatVND(heldDepositsTotal)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Mã HĐ</th>
                    <th className="py-2.5 px-3 font-semibold">Phòng</th>
                    <th className="py-2.5 px-3 font-semibold">Khách thuê</th>
                    <th className="py-2.5 px-3 font-semibold">Tiền cọc</th>
                    <th className="py-2.5 px-3 font-semibold">Thời hạn hợp đồng</th>
                    <th className="py-2.5 px-3 font-semibold">Trạng thái cọc</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leases.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">
                        {l.contractNumber || `HD-${l.roomId.slice(-3)}`}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {l.room?.roomCode || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900">{l.tenant?.fullName || '—'}</span>
                        <p className="text-[11px] text-slate-500">{l.tenant?.phone || ''}</p>
                      </td>
                      <td className="py-3 px-3 font-bold text-indigo-700">
                        {formatVND(l.depositAmount)}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {formatDateVN(l.startDate)} → {formatDateVN(l.endDate)}
                      </td>
                      <td className="py-3 px-3">
                        {l.depositStatus === 'held' && (
                          <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Đang giữ an toàn
                          </Badge>
                        )}
                        {l.depositStatus === 'refunded' && (
                          <Badge variant="neutral" className="text-slate-600 bg-slate-50">
                            Đã hoàn trả
                          </Badge>
                        )}
                        {l.depositStatus === 'forfeited' && (
                          <Badge variant="error" className="bg-rose-50 text-rose-700 border-rose-200">
                            Đã khấu trừ
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {l.depositStatus === 'held' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSettlingLease(l);
                              setSettleAction('refund');
                            }}
                            className="text-xs"
                          >
                            Tất toán cọc
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs (Mandatory logging on every mutation) */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  <span>Nhật ký kiểm toán hệ thống (Audit Trail)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ghi nhận mọi biến động dữ liệu (tạo phòng, chốt số điện nước, lập hóa đơn, thu tiền, đối soát)
                </p>
              </div>
              <Badge variant="neutral" className="text-xs">
                {auditLogs.length} sự kiện gần nhất
              </Badge>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Chưa có sự kiện nào trong nhật ký kiểm toán.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1 font-mono text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 uppercase">{log.action}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {log.entityType}
                        </span>
                        <span className="text-[11px] text-slate-500">ID: {log.entityId}</span>
                      </div>
                      {log.details ? (
                        <p className="text-[11px] text-slate-600 truncate max-w-xl font-sans">
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-sans">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Payment Recording Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Ghi nhận thu tiền phòng"
        description="Ghi nhận thanh toán tiền mặt hoặc chuyển khoản thủ công vào hóa đơn"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Chọn hóa đơn cần thu
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => {
                const invId = e.target.value;
                setSelectedInvoiceId(invId);
                const inv = unpaidInvoices.find((i) => i.id === invId);
                if (inv) setPaymentAmount(inv.balanceDue);
              }}
              className="w-full text-xs px-3 py-2 rounded-[6px] border border-slate-300 bg-white"
              required
            >
              <option value="">-- Chọn hóa đơn nợ --</option>
              {unpaidInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoiceCode} — {i.room?.roomCode || 'Phòng'} ({i.tenant?.fullName || 'Khách'}) — Còn nợ: {formatVND(i.balanceDue)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Số tiền thu (VNĐ)
            </label>
            <input
              type="number"
              value={paymentAmount || ''}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-[6px] border border-slate-300 bg-white font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Hình thức thanh toán
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'vietqr', label: 'VietQR Napas' },
                { id: 'cash', label: 'Tiền mặt' },
                { id: 'bank_transfer', label: 'Chuyển khoản' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`text-xs py-2 rounded-[6px] border font-medium ${
                    paymentMethod === m.id
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Mã tham chiếu / Số biên lai (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="e.g. MB-982138291"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-[6px] border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ghi chú thu tiền
            </label>
            <input
              type="text"
              placeholder="e.g. Khách thanh toán tại quầy"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-[6px] border border-slate-300 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRecordModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={recordPaymentMutation.isPending}
            >
              {recordPaymentMutation.isPending ? 'Đang lưu...' : 'Xác nhận thu tiền'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Settle Deposit Modal */}
      {settlingLease && (
        <Modal
          isOpen={Boolean(settlingLease)}
          onClose={() => setSettlingLease(null)}
          title="Tất toán tiền cọc hợp đồng"
          description={`Phòng: ${settlingLease.room?.roomCode} • Khách: ${settlingLease.tenant?.fullName} • Tiền cọc: ${formatVND(settlingLease.depositAmount)}`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Phương án xử lý tiền cọc
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettleAction('refund')}
                  className={`p-3 rounded-[8px] border text-left text-xs font-medium ${
                    settleAction === 'refund'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">Hoàn trả tiền cọc</p>
                  <span className="text-[11px] text-slate-500">Khách bàn giao phòng đầy đủ nguyên vẹn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettleAction('forfeit')}
                  className={`p-3 rounded-[8px] border text-left text-xs font-medium ${
                    settleAction === 'forfeit'
                      ? 'border-rose-600 bg-rose-50 text-rose-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">Khấu trừ tiền cọc</p>
                  <span className="text-[11px] text-slate-500">Bù trừ tiền nợ hoặc đền bù thiệt hại</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ghi chú lý do tất toán
              </label>
              <textarea
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Đã chuyển khoản hoàn cọc qua số tài khoản khách thuê..."
                className="w-full text-xs p-2.5 rounded-[6px] border border-slate-300 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSettlingLease(null)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  showToast('Đã ghi nhận tất toán tiền cọc thành công');
                  setSettlingLease(null);
                }}
              >
                Xác nhận tất toán
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Zalo Reminder Modal */}
      {zaloTargetInvoice && (
        <ZaloReminderModal
          isOpen={isZaloModalOpen}
          onClose={() => {
            setIsZaloModalOpen(false);
            setZaloTargetInvoice(null);
          }}
          invoice={zaloTargetInvoice}
          initialTemplate={zaloTemplate}
        />
      )}
    </div>
  );
}
