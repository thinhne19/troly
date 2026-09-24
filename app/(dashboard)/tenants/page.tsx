'use client';

// app/(dashboard)/tenants/page.tsx — Tenant CRUD & Profile Drawer
import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Users,
  Plus,
  Search,
  Phone,
  ShieldCheck,
  Calendar,
  CreditCard,
  MessageCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  UserCheck,
  DoorOpen,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
} from '@/hooks/use-tenants';
import { useRooms } from '@/hooks/use-rooms';
import { usePropertyStore } from '@/stores/use-property-store';
import { formatVND, formatDateVN } from '@/lib/utils';
import { Tenant } from '@/types/models';
import { tenantSchema, TenantFormValues } from '@/types/forms';

export default function TenantsPage() {
  const { selectedPropertyId } = usePropertyStore();
  const { data: tenants, isLoading } = useTenants();
  const { data: rooms } = useRooms(selectedPropertyId);

  const createTenantMutation = useCreateTenant();
  const updateTenantMutation = useUpdateTenant();
  const deleteTenantMutation = useDeleteTenant();

  const [activeFilter, setActiveFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTenantId, setSelectedTenantId] = React.useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingTenant, setEditingTenant] = React.useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = React.useState<Tenant | null>(null);

  // Form for Registering Tenant
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    watch: watchCreate,
    formState: { errors: errorsCreate },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      nationalId: '',
      idIssueDate: '2022-05-15',
      idIssuePlace: 'Cục Cảnh sát QLHC về TTXH',
      emergencyContactName: '',
      emergencyContactPhone: '',
      roomId: '',
      startDate: '2026-10-01',
      endDate: '2027-09-30',
      depositAmount: 4500000,
      monthlyRent: 4500000,
    },
  });

  // Form for Editing Tenant
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
  });

  React.useEffect(() => {
    if (editingTenant) {
      resetEdit({
        fullName: editingTenant.fullName,
        phone: editingTenant.phone,
        nationalId: editingTenant.nationalId,
        idIssueDate: editingTenant.idIssueDate || '',
        idIssuePlace: editingTenant.idIssuePlace || '',
        emergencyContactName: editingTenant.emergencyContactName || '',
        emergencyContactPhone: editingTenant.emergencyContactPhone || '',
        roomId: editingTenant.currentRoom?.id || '',
        startDate: '',
        endDate: '',
        depositAmount: 0,
        monthlyRent: 0,
      });
    }
  }, [editingTenant, resetEdit]);

  const selectedTenant = tenants?.find((t) => t.id === selectedTenantId);

  // KPI Calculations
  const totalCount = tenants?.length || 0;
  const activeCount = tenants?.filter((t) => t.status === 'active').length || 0;
  const movedOutCount = tenants?.filter((t) => t.status === 'moved_out').length || 0;

  // Filtered tenants
  const filteredTenants = React.useMemo(() => {
    if (!tenants) return [];
    return tenants.filter((tenant) => {
      if (activeFilter === 'active' && tenant.status !== 'active') return false;
      if (activeFilter === 'moved_out' && tenant.status !== 'moved_out') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = tenant.fullName.toLowerCase().includes(q);
        const matchPhone = tenant.phone.includes(q);
        const matchId = tenant.nationalId.includes(q);
        const matchRoom = tenant.currentRoom?.roomCode.toLowerCase().includes(q);
        return matchName || matchPhone || matchId || matchRoom;
      }
      return true;
    });
  }, [tenants, activeFilter, searchQuery]);

  // Form Handlers
  const onCreateSubmit = async (values: TenantFormValues) => {
    await createTenantMutation.mutateAsync({
      tenant: {
        userId: 'usr-landlord-001',
        fullName: values.fullName,
        phone: values.phone,
        nationalId: values.nationalId,
        idIssueDate: values.idIssueDate,
        idIssuePlace: values.idIssuePlace,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        status: 'active',
      },
      lease: values.roomId
        ? {
            roomId: values.roomId,
            startDate: values.startDate || '2026-10-01',
            endDate: values.endDate || '2027-09-30',
            monthlyRent: Number(values.monthlyRent || 4500000),
            depositAmount: Number(values.depositAmount || 0),
          }
        : undefined,
    });
    setIsCreateModalOpen(false);
    resetCreate();
  };

  const onEditSubmit = async (values: TenantFormValues) => {
    if (!editingTenant) return;
    await updateTenantMutation.mutateAsync({
      id: editingTenant.id,
      data: {
        fullName: values.fullName,
        phone: values.phone,
        nationalId: values.nationalId,
        idIssueDate: values.idIssueDate,
        idIssuePlace: values.idIssuePlace,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
      },
    });
    setEditingTenant(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTenant) return;
    await deleteTenantMutation.mutateAsync(deletingTenant.id);
    setDeletingTenant(null);
    if (selectedTenantId === deletingTenant.id) {
      setSelectedTenantId(null);
    }
  };

  const selectedRoomInForm = watchCreate('roomId');

  const columns: Column<Tenant>[] = [
    {
      header: 'Khách thuê',
      accessorKey: 'fullName',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700 shrink-0">
            {row.fullName.split(' ').slice(-1)[0]?.charAt(0) || 'K'}
          </div>
          <div>
            <button
              onClick={() => setSelectedTenantId(row.id)}
              className="font-bold text-slate-900 hover:text-indigo-600 hover:underline text-left block"
            >
              {row.fullName}
            </button>
            <div className="text-xs text-slate-400">{row.phone}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Phòng cư trú',
      align: 'center',
      cell: (row) => {
        if (!row.currentRoom) {
          return <span className="text-slate-400 italic text-xs">Chưa gán phòng</span>;
        }
        return (
          <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-[6px] text-xs">
            {row.currentRoom.roomCode}
          </span>
        );
      },
    },
    {
      header: 'Số CCCD / Định danh',
      accessorKey: 'nationalId',
      cell: (row) => (
        <span className="font-mono text-slate-700 tabular-nums text-xs">
          {row.nationalId}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      align: 'center',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'} dot>
          {row.status === 'active' ? 'Đang thuê' : 'Đã rời đi'}
        </Badge>
      ),
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <a
            href={`https://zalo.me/${row.phone.replace(/^0/, '84')}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="ghost" size="icon-sm" title="Nhắn Zalo">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </Button>
          </a>
          <Button
            onClick={() => setSelectedTenantId(row.id)}
            variant="ghost"
            size="sm"
          >
            Hồ sơ
          </Button>
          <Button
            onClick={() => setEditingTenant(row)}
            variant="ghost"
            size="icon-sm"
            title="Sửa thông tin"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-600" />
          </Button>
          <Button
            onClick={() => setDeletingTenant(row)}
            variant="ghost"
            size="icon-sm"
            title="Xóa khách"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          </Button>
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
            Hồ sơ Khách thuê & Cư trú
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý thông tin định danh CCCD, hợp đồng thuê phòng và liên lạc Zalo trực tiếp
          </p>
        </div>

        <Button
          onClick={() => {
            resetCreate({
              fullName: '',
              phone: '',
              nationalId: '',
              idIssueDate: '2022-05-15',
              idIssuePlace: 'Cục Cảnh sát QLHC về TTXH',
              emergencyContactName: '',
              emergencyContactPhone: '',
              roomId: '',
              startDate: '2026-10-01',
              endDate: '2027-09-30',
              depositAmount: 4500000,
              monthlyRent: 4500000,
            });
            setIsCreateModalOpen(true);
          }}
          variant="primary"
          size="md"
        >
          <Plus className="h-4 w-4" />
          <span>Đăng ký khách mới</span>
        </Button>
      </div>

      {/* KPI Metric Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tổng khách trong hệ thống
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalCount} người
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Đang cư trú thực tế
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {activeCount} người
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Đã thanh lý / Rời đi
          </span>
          <div className="text-xl font-bold text-slate-700 mt-1 tabular-nums">
            {movedOutCount} người
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-[12px] border border-slate-200">
        <Tabs
          tabs={[
            { id: 'all', label: 'Tất cả khách', count: totalCount },
            { id: 'active', label: 'Đang thuê', count: activeCount },
            { id: 'moved_out', label: 'Đã dời đi', count: movedOutCount },
          ]}
          activeTab={activeFilter}
          onChange={setActiveFilter}
        />

        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, SĐT, CCCD..."
            leadingIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredTenants}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
      />

      {/* Slide-over Profile Drawer */}
      <Drawer
        isOpen={Boolean(selectedTenantId)}
        onClose={() => setSelectedTenantId(null)}
        title={selectedTenant?.fullName || 'Hồ sơ khách thuê'}
        description={`Mã định danh CCCD: ${selectedTenant?.nationalId || '---'}`}
        width="lg"
      >
        {selectedTenant && (
          <div className="space-y-6 text-sm">
            {/* Contact quick actions */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[10px] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Số điện thoại liên lạc</span>
                <div className="font-bold text-slate-900 text-base">
                  {selectedTenant.phone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedTenant.phone}`}
                  className="p-2 rounded-[8px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
                  title="Gọi điện thoại"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={`https://zalo.me/${selectedTenant.phone.replace(/^0/, '84')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-[8px] bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs hover:bg-blue-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Nhắn Zalo</span>
                </a>
              </div>
            </div>

            {/* Legal Information & CCCD */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Thông tin pháp lý & CCCD
              </h4>
              <div className="bg-white border border-slate-200 rounded-[10px] p-4 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Số thẻ CCCD:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedTenant.nationalId}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Ngày cấp:</span>
                  <span className="text-slate-800">{formatDateVN(selectedTenant.idIssueDate)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Nơi cấp:</span>
                  <span className="text-slate-800">
                    {selectedTenant.idIssuePlace || 'Cục CS QLHC về TTXH'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Người liên hệ khẩn cấp
              </h4>
              <div className="bg-white border border-slate-200 rounded-[10px] p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Họ tên:</span>
                  <span className="font-medium text-slate-900">
                    {selectedTenant.emergencyContactName || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="text-slate-800 font-mono">
                    {selectedTenant.emergencyContactPhone || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            </div>

            {/* Room & Lease Overview */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Phòng đang ở & Hợp đồng
              </h4>
              <div className="bg-white border border-slate-200 rounded-[10px] p-4 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Phòng thuê:</span>
                  <span className="font-bold text-indigo-600">
                    {selectedTenant.currentRoom?.roomCode || 'Chưa gán phòng'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tiền cọc giữ chân:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatVND(selectedTenant.currentRoom?.baseRent || 4500000)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Trạng thái cư trú:</span>
                  <Badge variant={selectedTenant.status === 'active' ? 'success' : 'neutral'} dot size="sm">
                    {selectedTenant.status === 'active' ? 'Đang thuê' : 'Đã dời đi'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setEditingTenant(selectedTenant);
                  setSelectedTenantId(null);
                }}
                variant="secondary"
                className="w-full"
              >
                <Edit2 className="h-4 w-4" />
                <span>Chỉnh sửa hồ sơ khách</span>
              </Button>

              <Link href="/leases" className="w-full">
                <Button variant="secondary" className="w-full">
                  <FileText className="h-4 w-4" />
                  <span>Quản lý hợp đồng thuê</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal: Register New Tenant (Zod Validated) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Đăng ký khách thuê mới"
        description="Nhập thông tin cư trú và thiết lập hợp đồng thuê phòng"
      >
        <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Họ và tên khách thuê *
            </label>
            <Input
              {...registerCreate('fullName')}
              placeholder="VD: Nguyễn Văn An"
              error={errorsCreate.fullName?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số điện thoại *
              </label>
              <Input
                {...registerCreate('phone')}
                placeholder="0912 345 678"
                error={errorsCreate.phone?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số CCCD / CMND *
              </label>
              <Input
                {...registerCreate('nationalId')}
                placeholder="12 chữ số"
                error={errorsCreate.nationalId?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ngày cấp CCCD
              </label>
              <Input type="date" {...registerCreate('idIssueDate')} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Nơi cấp CCCD
              </label>
              <Input
                {...registerCreate('idIssuePlace')}
                placeholder="Cục CS QLHC về TTXH"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Người liên hệ khẩn
              </label>
              <Input
                {...registerCreate('emergencyContactName')}
                placeholder="VD: Bố/Mẹ/Anh"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                SĐT khẩn cấp
              </label>
              <Input
                {...registerCreate('emergencyContactPhone')}
                placeholder="09xx..."
              />
            </div>
          </div>

          {/* Optional Room Assignment Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[10px] space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Gán phòng & Hợp đồng khởi tạo (Tùy chọn)
            </span>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Phòng cho thuê
              </label>
              <select
                {...registerCreate('roomId')}
                className="w-full h-10 px-3 rounded-[8px] border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Chưa gán phòng (Lưu hồ sơ trước) --</option>
                {rooms?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomCode} ({formatVND(r.baseRent)}/tháng) - {r.status === 'vacant' ? 'Phòng trống' : 'Đang thuê'}
                  </option>
                ))}
              </select>
            </div>

            {selectedRoomInForm && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Tiền cọc giữ chân (₫)
                  </label>
                  <Input
                    type="number"
                    {...registerCreate('depositAmount')}
                    isNumericTabular
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Giá thuê tháng (₫)
                  </label>
                  <Input
                    type="number"
                    {...registerCreate('monthlyRent')}
                    isNumericTabular
                  />
                </div>
              </div>
            )}
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
              isLoading={createTenantMutation.isPending}
            >
              Lưu hồ sơ khách
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Tenant (Zod Validated) */}
      <Modal
        isOpen={Boolean(editingTenant)}
        onClose={() => setEditingTenant(null)}
        title={`Sửa hồ sơ: ${editingTenant?.fullName}`}
        description="Cập nhật thông tin số điện thoại, CCCD hoặc liên hệ khẩn cấp"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Họ và tên khách thuê *
            </label>
            <Input
              {...registerEdit('fullName')}
              error={errorsEdit.fullName?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số điện thoại *
              </label>
              <Input
                {...registerEdit('phone')}
                error={errorsEdit.phone?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số CCCD / CMND *
              </label>
              <Input
                {...registerEdit('nationalId')}
                error={errorsEdit.nationalId?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ngày cấp CCCD
              </label>
              <Input type="date" {...registerEdit('idIssueDate')} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Nơi cấp CCCD
              </label>
              <Input {...registerEdit('idIssuePlace')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Người liên hệ khẩn
              </label>
              <Input {...registerEdit('emergencyContactName')} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                SĐT khẩn cấp
              </label>
              <Input {...registerEdit('emergencyContactPhone')} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingTenant(null)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateTenantMutation.isPending}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deletingTenant)}
        onClose={() => setDeletingTenant(null)}
        title="Xóa hồ sơ khách thuê"
        description={`Bạn có chắc chắn muốn xóa khách thuê ${deletingTenant?.fullName}?`}
      >
        <div className="space-y-4">
          {deletingTenant?.currentRoom && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[10px] text-xs text-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                Khách thuê này hiện đang liên kết với phòng{' '}
                <strong className="font-bold">{deletingTenant.currentRoom.roomCode}</strong>.
                Xóa khách thuê sẽ giải phóng phòng thành phòng trống.
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600">
            Hành động này sẽ xóa dữ liệu thông tin cá nhân của khách khỏi hệ thống.
          </p>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingTenant(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleteTenantMutation.isPending}
            >
              Xác nhận xóa khách
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
