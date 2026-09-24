'use client';

// app/(dashboard)/leases/page.tsx — Lease Management Module
import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Check,
  Building,
  UserCheck,
  DoorOpen,
  DollarSign,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import {
  useLeases,
  useCreateLease,
  useUpdateLease,
  useTerminateLease,
  useExtendLease,
} from '@/hooks/use-leases';
import { useRooms } from '@/hooks/use-rooms';
import { useTenants } from '@/hooks/use-tenants';
import { usePropertyStore } from '@/stores/use-property-store';
import { formatVND, formatDateVN } from '@/lib/utils';
import { Lease, DepositStatus } from '@/types/models';
import {
  leaseSchema,
  terminateLeaseSchema,
  extendLeaseSchema,
  LeaseFormValues,
  TerminateLeaseFormValues,
  ExtendLeaseFormValues,
} from '@/types/forms';

export default function LeasesPage() {
  const { selectedPropertyId } = usePropertyStore();
  const { data: leases, isLoading } = useLeases(selectedPropertyId);
  const { data: rooms } = useRooms(selectedPropertyId);
  const { data: tenants } = useTenants();

  const createLeaseMutation = useCreateLease();
  const updateLeaseMutation = useUpdateLease();
  const terminateLeaseMutation = useTerminateLease();
  const extendLeaseMutation = useExtendLease();

  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [extendingLease, setExtendingLease] = React.useState<Lease | null>(null);
  const [terminatingLease, setTerminatingLease] = React.useState<Lease | null>(null);

  // Form for Create Lease
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    watch: watchCreate,
    setValue: setCreateValue,
    formState: { errors: errorsCreate },
  } = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      roomId: '',
      tenantId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      monthlyRent: 4500000,
      depositAmount: 4500000,
      contractNumber: '',
      notes: '',
    },
  });

  // Form for Extend Lease
  const {
    register: registerExtend,
    handleSubmit: handleSubmitExtend,
    reset: resetExtend,
    formState: { errors: errorsExtend },
  } = useForm<ExtendLeaseFormValues>({
    resolver: zodResolver(extendLeaseSchema),
  });

  // Form for Terminate Lease
  const {
    register: registerTerminate,
    handleSubmit: handleSubmitTerminate,
    reset: resetTerminate,
    watch: watchTerminate,
    formState: { errors: errorsTerminate },
  } = useForm<TerminateLeaseFormValues>({
    resolver: zodResolver(terminateLeaseSchema),
    defaultValues: {
      leaseId: '',
      depositStatus: 'refunded',
      refundAmount: 0,
      deductionReason: '',
      moveOutDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  // When room is chosen in Create Lease, auto-fill baseRent & deposit
  const chosenRoomId = watchCreate('roomId');
  React.useEffect(() => {
    if (chosenRoomId && rooms) {
      const room = rooms.find((r) => r.id === chosenRoomId);
      if (room) {
        setCreateValue('monthlyRent', room.baseRent);
        setCreateValue('depositAmount', room.baseRent);
        setCreateValue(
          'contractNumber',
          `HD-${new Date().getFullYear()}-${room.roomCode.replace(/[^a-zA-Z0-9]/g, '')}`
        );
      }
    }
  }, [chosenRoomId, rooms, setCreateValue]);

  // When extending lease is selected
  React.useEffect(() => {
    if (extendingLease) {
      const curEndDate = new Date(extendingLease.endDate);
      curEndDate.setFullYear(curEndDate.getFullYear() + 1);
      resetExtend({
        leaseId: extendingLease.id,
        newEndDate: curEndDate.toISOString().split('T')[0],
        newRent: extendingLease.monthlyRent,
        notes: `Gia hạn hợp đồng 12 tháng từ ngày ${extendingLease.endDate}`,
      });
    }
  }, [extendingLease, resetExtend]);

  // When terminating lease is selected
  React.useEffect(() => {
    if (terminatingLease) {
      resetTerminate({
        leaseId: terminatingLease.id,
        depositStatus: 'refunded',
        refundAmount: terminatingLease.depositAmount,
        deductionReason: '',
        moveOutDate: new Date().toISOString().split('T')[0],
        notes: 'Thanh lý hợp đồng và nghiệm thu phòng',
      });
    }
  }, [terminatingLease, resetTerminate]);

  // Calculate days remaining in lease
  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // KPIs
  const totalCount = leases?.length || 0;
  const activeCount = leases?.filter((l) => l.status === 'active').length || 0;
  const expiringSoonCount =
    leases?.filter((l) => {
      if (l.status !== 'active') return false;
      const days = getDaysRemaining(l.endDate);
      return days >= 0 && days <= 30;
    }).length || 0;
  const terminatedCount =
    leases?.filter((l) => l.status === 'terminated' || l.status === 'expired').length || 0;

  // Filtered leases
  const filteredLeases = React.useMemo(() => {
    if (!leases) return [];
    return leases.filter((lease) => {
      if (activeTab === 'active' && lease.status !== 'active') return false;
      if (activeTab === 'expiring') {
        if (lease.status !== 'active') return false;
        const days = getDaysRemaining(lease.endDate);
        return days >= 0 && days <= 30;
      }
      if (activeTab === 'terminated' && lease.status === 'active') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchCode = lease.contractNumber?.toLowerCase().includes(q);
        const matchRoom = lease.room?.roomCode.toLowerCase().includes(q);
        const matchTenant = lease.tenant?.fullName.toLowerCase().includes(q);
        return matchCode || matchRoom || matchTenant;
      }
      return true;
    });
  }, [leases, activeTab, searchQuery]);

  // Submit Handlers
  const onCreateSubmit = async (values: LeaseFormValues) => {
    await createLeaseMutation.mutateAsync({
      roomId: values.roomId,
      tenantId: values.tenantId,
      startDate: values.startDate,
      endDate: values.endDate,
      monthlyRent: Number(values.monthlyRent),
      depositAmount: Number(values.depositAmount),
      depositStatus: 'held',
      status: 'active',
      contractNumber: values.contractNumber,
      notes: values.notes,
    });
    setIsCreateModalOpen(false);
    resetCreate();
  };

  const onExtendSubmit = async (values: ExtendLeaseFormValues) => {
    if (!extendingLease) return;
    await extendLeaseMutation.mutateAsync({
      id: values.leaseId,
      newEndDate: values.newEndDate,
      newRent: Number(values.newRent),
      notes: values.notes,
    });
    setExtendingLease(null);
  };

  const onTerminateSubmit = async (values: TerminateLeaseFormValues) => {
    if (!terminatingLease) return;
    await terminateLeaseMutation.mutateAsync({
      id: values.leaseId,
      depositStatus: values.depositStatus as DepositStatus,
      notes: values.notes || values.deductionReason,
    });
    setTerminatingLease(null);
  };

  const columns: Column<Lease>[] = [
    {
      header: 'Số Hợp đồng',
      accessorKey: 'contractNumber',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 font-mono text-xs">
            {row.contractNumber || 'HD-2026-CHƯA_ĐẶT'}
          </div>
          <div className="text-[11px] text-slate-400">
            Tạo ngày {formatDateVN(row.createdAt)}
          </div>
        </div>
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
          <div className="text-[11px] text-slate-400">{row.tenant?.phone}</div>
        </div>
      ),
    },
    {
      header: 'Thời hạn hợp đồng',
      cell: (row) => {
        const daysRemaining = getDaysRemaining(row.endDate);
        const isExpiringSoon = row.status === 'active' && daysRemaining <= 30 && daysRemaining >= 0;
        const isExpired = row.status === 'active' && daysRemaining < 0;

        return (
          <div className="space-y-0.5">
            <div className="text-xs text-slate-700 font-medium tabular-nums">
              {formatDateVN(row.startDate)} – {formatDateVN(row.endDate)}
            </div>
            {row.status === 'active' && (
              <div>
                {isExpired ? (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-[4px]">
                    Quá hạn {Math.abs(daysRemaining)} ngày
                  </span>
                ) : isExpiringSoon ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-[4px]">
                    Còn {daysRemaining} ngày (Sắp hết hạn)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    Còn {daysRemaining} ngày
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Giá thuê / tháng',
      align: 'right',
      accessorKey: 'monthlyRent',
      cell: (row) => (
        <span className="font-semibold text-slate-900 tabular-nums">
          {formatVND(row.monthlyRent)}
        </span>
      ),
    },
    {
      header: 'Tiền cọc',
      align: 'right',
      cell: (row) => {
        const statusMap = {
          held: { label: 'Đang giữ', color: 'text-slate-700' },
          refunded: { label: 'Đã hoàn trả', color: 'text-emerald-600 font-medium' },
          partially_refunded: { label: 'Khấu trừ 1 phần', color: 'text-amber-700' },
          forfeited: { label: 'Không hoàn cọc', color: 'text-rose-600' },
        }[row.depositStatus];

        return (
          <div>
            <div className="font-bold text-slate-900 tabular-nums text-xs">
              {formatVND(row.depositAmount)}
            </div>
            <div className={`text-[10px] ${statusMap?.color || 'text-slate-400'}`}>
              {statusMap?.label || row.depositStatus}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      align: 'center',
      cell: (row) => {
        const badgeMap = {
          active: { label: 'Hiệu lực', variant: 'success' as const, dot: true },
          expired: { label: 'Hết hạn', variant: 'warning' as const, dot: false },
          terminated: { label: 'Đã thanh lý', variant: 'neutral' as const, dot: false },
        }[row.status];

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
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'active' && (
            <>
              <Button
                onClick={() => setExtendingLease(row)}
                variant="secondary"
                size="sm"
                title="Gia hạn thêm thời gian thuê"
              >
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>Gia hạn</span>
              </Button>
              <Button
                onClick={() => setTerminatingLease(row)}
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                title="Trả phòng và xử lý cọc"
              >
                <span>Thanh lý</span>
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý Hợp đồng Thuê phòng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi thời hạn hợp đồng, cảnh báo tái ký trước 30 ngày và quyết toán tiền cọc
          </p>
        </div>

        <Button
          onClick={() => {
            resetCreate({
              roomId: '',
              tenantId: '',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
              monthlyRent: 4500000,
              depositAmount: 4500000,
              contractNumber: '',
              notes: '',
            });
            setIsCreateModalOpen(true);
          }}
          variant="primary"
          size="md"
        >
          <Plus className="h-4 w-4" />
          <span>Lập hợp đồng mới</span>
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tổng hợp đồng
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalCount} HĐ
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Đang hiệu lực
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {activeCount} HĐ
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Sắp hết hạn (&lt; 30 ngày)
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums">
            {expiringSoonCount} HĐ
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Đã thanh lý
          </span>
          <div className="text-xl font-bold text-slate-700 mt-1 tabular-nums">
            {terminatedCount} HĐ
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-[12px] border border-slate-200">
        <Tabs
          tabs={[
            { id: 'all', label: 'Tất cả HĐ', count: totalCount },
            { id: 'active', label: 'Đang hiệu lực', count: activeCount },
            { id: 'expiring', label: 'Sắp hết hạn', count: expiringSoonCount },
            { id: 'terminated', label: 'Đã thanh lý', count: terminatedCount },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số HĐ, phòng, tên khách..."
            leadingIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredLeases}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
      />

      {/* Modal: Create Lease */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Lập hợp đồng thuê mới"
        description="Gán khách thuê vào phòng và thiết lập thời hạn hiệu lực"
      >
        <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Chọn phòng thuê *
              </label>
              <select
                {...registerCreate('roomId')}
                className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Chọn phòng --</option>
                {rooms?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomCode} ({formatVND(r.baseRent)}/tháng) - {r.status}
                  </option>
                ))}
              </select>
              {errorsCreate.roomId && (
                <p className="text-xs text-rose-600 mt-1">{errorsCreate.roomId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Chọn khách thuê *
              </label>
              <select
                {...registerCreate('tenantId')}
                className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Chọn khách thuê --</option>
                {tenants?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.phone})
                  </option>
                ))}
              </select>
              {errorsCreate.tenantId && (
                <p className="text-xs text-rose-600 mt-1">{errorsCreate.tenantId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ngày bắt đầu *
              </label>
              <Input type="date" {...registerCreate('startDate')} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ngày kết thúc *
              </label>
              <Input type="date" {...registerCreate('endDate')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Giá thuê tháng (₫) *
              </label>
              <Input
                type="number"
                {...registerCreate('monthlyRent')}
                isNumericTabular
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Tiền cọc giữ chân (₫) *
              </label>
              <Input
                type="number"
                {...registerCreate('depositAmount')}
                isNumericTabular
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Mã số hợp đồng
              </label>
              <Input
                {...registerCreate('contractNumber')}
                placeholder="VD: HD-2026-P101"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ghi chú điều khoản
              </label>
              <Input
                {...registerCreate('notes')}
                placeholder="VD: Đóng tiền ngày 1 hàng tháng"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createLeaseMutation.isPending}
            >
              Ký hợp đồng
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Extend Lease */}
      <Modal
        isOpen={Boolean(extendingLease)}
        onClose={() => setExtendingLease(null)}
        title={`Gia hạn hợp đồng: ${extendingLease?.contractNumber}`}
        description={`Phòng ${extendingLease?.room?.roomCode} • Khách thuê: ${extendingLease?.tenant?.fullName}`}
      >
        <form onSubmit={handleSubmitExtend(onExtendSubmit)} className="space-y-4">
          <input type="hidden" {...registerExtend('leaseId')} />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px] text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Thời hạn hiện tại:</span>
              <span className="font-semibold text-slate-800">
                {formatDateVN(extendingLease?.startDate)} – {formatDateVN(extendingLease?.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Giá thuê hiện tại:</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {formatVND(extendingLease?.monthlyRent)}/tháng
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ngày kết thúc mới *
              </label>
              <Input type="date" {...registerExtend('newEndDate')} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Giá thuê mới (₫/tháng) *
              </label>
              <Input
                type="number"
                {...registerExtend('newRent')}
                isNumericTabular
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Ghi chú phụ lục gia hạn
            </label>
            <Input
              {...registerExtend('notes')}
              placeholder="VD: Hai bên đồng ý gia hạn 12 tháng giữ nguyên giá"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setExtendingLease(null)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={extendLeaseMutation.isPending}
            >
              Xác nhận gia hạn
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Terminate Lease & Deposit Settlement */}
      <Modal
        isOpen={Boolean(terminatingLease)}
        onClose={() => setTerminatingLease(null)}
        title={`Thanh lý hợp đồng & Quyết toán cọc`}
        description={`HĐ: ${terminatingLease?.contractNumber} • Phòng ${terminatingLease?.room?.roomCode}`}
      >
        <form onSubmit={handleSubmitTerminate(onTerminateSubmit)} className="space-y-4">
          <input type="hidden" {...registerTerminate('leaseId')} />

          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-[10px] text-xs text-rose-800 space-y-1.5">
            <div className="font-bold flex items-center gap-1 text-rose-900">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>Thủ tục trả phòng & Giải phóng tình trạng phòng</span>
            </div>
            <p>
              Khi thanh lý, trạng thái hợp đồng sẽ chuyển thành <strong>Đã thanh lý</strong> và phòng{' '}
              <strong>{terminatingLease?.room?.roomCode}</strong> sẽ được chuyển thành <strong>Phòng trống</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ngày dọn đi thực tế *
              </label>
              <Input type="date" {...registerTerminate('moveOutDate')} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Tiền cọc ban đầu
              </label>
              <div className="h-10 px-3 flex items-center bg-slate-100 rounded-[10px] font-bold text-slate-900 tabular-nums text-sm">
                {formatVND(terminatingLease?.depositAmount)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Hình thức quyết toán tiền cọc
            </label>
            <select
              {...registerTerminate('depositStatus')}
              className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="refunded">Hoàn trả đủ 100% tiền cọc cho khách</option>
              <option value="partially_refunded">Khấu trừ một phần (hỏng đồ / bù điện nước)</option>
              <option value="forfeited">Không hoàn cọc (vi phạm thời hạn hợp đồng)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Lý do khấu trừ / Ghi chú nghiệm thu
            </label>
            <Input
              {...registerTerminate('notes')}
              placeholder="VD: Khấu trừ 500k tiền sơn lại tường phòng, trả cọc phần còn lại"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setTerminatingLease(null)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={terminateLeaseMutation.isPending}
            >
              Xác nhận thanh lý HĐ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
