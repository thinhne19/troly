'use client';

// app/(dashboard)/rooms/page.tsx — Room CRUD & Inspection Drawer
import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DoorOpen,
  Plus,
  Search,
  Zap,
  Droplet,
  Phone,
  Edit2,
  Trash2,
  MessageCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from '@/hooks/use-rooms';
import { useProperties } from '@/hooks/use-properties';
import { usePropertyStore } from '@/stores/use-property-store';
import { formatVND, formatDateVN } from '@/lib/utils';
import { Room, RoomStatus } from '@/types/models';
import { roomSchema, RoomFormValues } from '@/types/forms';

export default function RoomsPage() {
  const { selectedPropertyId } = usePropertyStore();
  const { data: properties } = useProperties();
  const { data: rooms, isLoading } = useRooms(selectedPropertyId);

  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();

  const [activeFilter, setActiveFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = React.useState<Room | null>(null);

  const activePropertyId =
    selectedPropertyId && selectedPropertyId !== 'all'
      ? selectedPropertyId
      : properties?.[0]?.id || '';

  // Form for Create Room
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      propertyId: activePropertyId,
      roomCode: '',
      floor: 1,
      baseRent: 4500000,
      maxOccupants: 2,
      areaM2: 24,
      notes: '',
    },
  });

  // Form for Edit Room
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
  });

  // When editingRoom changes, reset the edit form
  React.useEffect(() => {
    if (editingRoom) {
      resetEdit({
        propertyId: editingRoom.propertyId,
        roomCode: editingRoom.roomCode,
        floor: editingRoom.floor,
        baseRent: editingRoom.baseRent,
        maxOccupants: editingRoom.maxOccupants,
        areaM2: editingRoom.areaM2 || 24,
        notes: editingRoom.notes || '',
      });
    }
  }, [editingRoom, resetEdit]);

  const selectedRoom = rooms?.find((r) => r.id === selectedRoomId);

  // KPI calculations
  const totalCount = rooms?.length || 0;
  const occupiedCount = rooms?.filter((r) => r.status === 'occupied').length || 0;
  const vacantCount = rooms?.filter((r) => r.status === 'vacant').length || 0;
  const maintenanceCount =
    rooms?.filter((r) => r.status === 'maintenance' || r.status === 'reserved').length || 0;

  // Filtered rooms
  const filteredRooms = React.useMemo(() => {
    if (!rooms) return [];
    return rooms.filter((room) => {
      if (activeFilter === 'occupied' && room.status !== 'occupied') return false;
      if (activeFilter === 'vacant' && room.status !== 'vacant') return false;
      if (activeFilter === 'maintenance' && room.status !== 'maintenance' && room.status !== 'reserved') {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchCode = room.roomCode.toLowerCase().includes(query);
        const matchTenant = room.currentTenant?.fullName.toLowerCase().includes(query);
        return matchCode || matchTenant;
      }
      return true;
    });
  }, [rooms, activeFilter, searchQuery]);

  // Form Handlers
  const onCreateSubmit = async (values: RoomFormValues) => {
    await createRoomMutation.mutateAsync({
      propertyId: values.propertyId,
      roomCode: values.roomCode,
      floor: Number(values.floor),
      baseRent: Number(values.baseRent),
      status: 'vacant',
      maxOccupants: Number(values.maxOccupants),
      areaM2: values.areaM2 ? Number(values.areaM2) : undefined,
      notes: values.notes,
    });
    setIsCreateModalOpen(false);
    resetCreate();
  };

  const onEditSubmit = async (values: RoomFormValues) => {
    if (!editingRoom) return;
    await updateRoomMutation.mutateAsync({
      id: editingRoom.id,
      data: {
        propertyId: values.propertyId,
        roomCode: values.roomCode,
        floor: Number(values.floor),
        baseRent: Number(values.baseRent),
        maxOccupants: Number(values.maxOccupants),
        areaM2: values.areaM2 ? Number(values.areaM2) : undefined,
        notes: values.notes,
      },
    });
    setEditingRoom(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRoom) return;
    await deleteRoomMutation.mutateAsync(deletingRoom.id);
    setDeletingRoom(null);
    if (selectedRoomId === deletingRoom.id) {
      setSelectedRoomId(null);
    }
  };

  const handleQuickStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    await updateRoomMutation.mutateAsync({
      id: roomId,
      data: { status: newStatus },
    });
  };

  const columns: Column<Room>[] = [
    {
      header: 'Phòng',
      accessorKey: 'roomCode',
      cell: (row) => (
        <button
          onClick={() => setSelectedRoomId(row.id)}
          className="font-bold text-indigo-600 hover:underline flex items-center gap-1.5 text-left"
        >
          <span>{row.roomCode}</span>
          <span className="text-[10px] text-slate-400 font-normal">
            (Tầng {row.floor})
          </span>
        </button>
      ),
    },
    {
      header: 'Khách thuê',
      cell: (row) => {
        if (!row.currentTenant) {
          return <span className="text-slate-400 italic text-xs">Phòng trống</span>;
        }
        return (
          <div>
            <div className="font-medium text-slate-900 text-xs sm:text-sm">
              {row.currentTenant.fullName}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{row.currentTenant.phone}</span>
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
        const statusMap = {
          occupied: { label: 'Đang thuê', variant: 'success' as const, dot: true },
          vacant: { label: 'Phòng trống', variant: 'neutral' as const, dot: false },
          reserved: { label: 'Đã cọc', variant: 'brand' as const, dot: true },
          maintenance: { label: 'Sửa chữa', variant: 'warning' as const, dot: false },
        }[row.status];

        return (
          <Badge variant={statusMap.variant} dot={statusMap.dot} size="sm">
            {statusMap.label}
          </Badge>
        );
      },
    },
    {
      header: 'Giá niêm yết',
      align: 'right',
      accessorKey: 'baseRent',
      cell: (row) => (
        <span className="font-semibold text-slate-900 tabular-nums">
          {formatVND(row.baseRent)}
        </span>
      ),
    },
    {
      header: 'Điện mới nhất',
      align: 'center',
      cell: (row) => {
        const reading = row.latestMeterReading;
        if (!reading) return <span className="text-slate-400 text-xs">--</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-700 tabular-nums">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>{reading.electricCurrent} kWh</span>
            <span className="text-[10px] text-slate-400">
              (+{reading.electricUsage})
            </span>
          </span>
        );
      },
    },
    {
      header: 'Nước mới nhất',
      align: 'center',
      cell: (row) => {
        const reading = row.latestMeterReading;
        if (!reading) return <span className="text-slate-400 text-xs">--</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-700 tabular-nums">
            <Droplet className="h-3 w-3 text-sky-500" />
            <span>{reading.waterCurrent} m³</span>
            <span className="text-[10px] text-slate-400">
              (+{reading.waterUsage})
            </span>
          </span>
        );
      },
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            onClick={() => setSelectedRoomId(row.id)}
            variant="ghost"
            size="sm"
          >
            Chi tiết
          </Button>
          <Button
            onClick={() => setEditingRoom(row)}
            variant="ghost"
            size="icon-sm"
            title="Sửa thông tin phòng"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-600" />
          </Button>
          <Button
            onClick={() => setDeletingRoom(row)}
            variant="ghost"
            size="icon-sm"
            title="Xóa phòng"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý Phòng & Giá thuê
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp danh sách các phòng, khách thuê đang cư trú và trạng thái tiền phòng
          </p>
        </div>

        <Button
          onClick={() => {
            resetCreate({
              propertyId: activePropertyId,
              roomCode: '',
              floor: 1,
              baseRent: 4500000,
              maxOccupants: 2,
              areaM2: 24,
              notes: '',
            });
            setIsCreateModalOpen(true);
          }}
          variant="primary"
          size="md"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm phòng mới</span>
        </Button>
      </div>

      {/* KPI Metric Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tổng số phòng
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalCount} phòng
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Đang cho thuê
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {occupiedCount} phòng
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Phòng còn trống
          </span>
          <div className="text-xl font-bold text-slate-700 mt-1 tabular-nums">
            {vacantCount} phòng
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Bảo trì / Giữ cọc
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums">
            {maintenanceCount} phòng
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-[12px] border border-slate-200">
        <Tabs
          tabs={[
            { id: 'all', label: 'Tất cả', count: totalCount },
            { id: 'occupied', label: 'Đang thuê', count: occupiedCount },
            { id: 'vacant', label: 'Phòng trống', count: vacantCount },
            { id: 'maintenance', label: 'Bảo trì / Cọc', count: maintenanceCount },
          ]}
          activeTab={activeFilter}
          onChange={setActiveFilter}
        />

        <div className="w-full sm:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số phòng, tên khách..."
            leadingIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Dense Table */}
      <DataTable
        columns={columns}
        data={filteredRooms}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
      />

      {/* Slide-over Inspection Drawer for Room Details */}
      <Drawer
        isOpen={Boolean(selectedRoomId)}
        onClose={() => setSelectedRoomId(null)}
        title={selectedRoom ? `Phòng ${selectedRoom.roomCode}` : 'Chi tiết phòng'}
        description={`Tầng ${selectedRoom?.floor || 1} • Diện tích ${selectedRoom?.areaM2 || 24} m² • Tối đa ${selectedRoom?.maxOccupants || 2} người`}
        width="md"
      >
        {selectedRoom && (
          <div className="space-y-6 text-sm">
            {/* Status overview */}
            <div className="bg-slate-50 p-4 rounded-[10px] border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Giá thuê niêm yết</span>
                <div className="text-lg font-bold text-slate-900 tabular-nums">
                  {formatVND(selectedRoom.baseRent)} / tháng
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedRoom.status}
                  onChange={(e) =>
                    handleQuickStatusChange(selectedRoom.id, e.target.value as RoomStatus)
                  }
                  className="text-xs font-semibold px-2.5 py-1 rounded-[6px] border border-slate-300 bg-white cursor-pointer focus:outline-none focus:border-indigo-600"
                >
                  <option value="occupied">Đang thuê</option>
                  <option value="vacant">Phòng trống</option>
                  <option value="reserved">Đã cọc giữ chỗ</option>
                  <option value="maintenance">Bảo trì / Sửa chữa</option>
                </select>
              </div>
            </div>

            {/* Current Tenant Card */}
            {selectedRoom.currentTenant ? (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Khách thuê hiện tại
                </h4>
                <div className="bg-white border border-slate-200 rounded-[10px] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-base">
                        {selectedRoom.currentTenant.fullName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Điện thoại: <span className="font-medium text-slate-800">{selectedRoom.currentTenant.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://zalo.me/${selectedRoom.currentTenant.phone.replace(/^0/, '84')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-[8px] bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Chat Zalo"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <a
                        href={`tel:${selectedRoom.currentTenant.phone}`}
                        className="p-1.5 rounded-[8px] bg-slate-100 text-slate-700 hover:bg-slate-200"
                        title="Gọi điện"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Số CCCD / CMND:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedRoom.currentTenant.nationalId}
                      </span>
                    </div>
                    {selectedRoom.currentLease && (
                      <>
                        <div className="flex justify-between">
                          <span>Mã hợp đồng:</span>
                          <span className="font-semibold text-indigo-600">
                            {selectedRoom.currentLease.contractNumber || 'HD-2026'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thời hạn hợp đồng:</span>
                          <span>
                            {formatDateVN(selectedRoom.currentLease.startDate)} – {formatDateVN(selectedRoom.currentLease.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiền cọc giữ:</span>
                          <span className="font-bold text-slate-900 tabular-nums">
                            {formatVND(selectedRoom.currentLease.depositAmount)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-[10px] text-center text-xs text-slate-500">
                Phòng này hiện đang trống. Bấm nút bên dưới để tạo hợp đồng cho khách.
              </div>
            )}

            {/* Latest Meter Readings */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Chỉ số điện nước gần nhất
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px]">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Điện</span>
                  </div>
                  <div className="text-base font-mono font-bold text-slate-900 mt-1 tabular-nums">
                    {selectedRoom.latestMeterReading?.electricCurrent || '--'} kWh
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tháng {selectedRoom.latestMeterReading?.billingMonth || 'gần nhất'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px]">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Droplet className="h-3.5 w-3.5 text-sky-500" />
                    <span>Nước</span>
                  </div>
                  <div className="text-base font-mono font-bold text-slate-900 mt-1 tabular-nums">
                    {selectedRoom.latestMeterReading?.waterCurrent || '--'} m³
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tháng {selectedRoom.latestMeterReading?.billingMonth || 'gần nhất'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setEditingRoom(selectedRoom);
                  setSelectedRoomId(null);
                }}
                variant="secondary"
                className="w-full"
              >
                <Edit2 className="h-4 w-4" />
                <span>Chỉnh sửa thông tin phòng</span>
              </Button>

              <Link href="/meter-readings" className="w-full">
                <Button variant="secondary" className="w-full">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Ghi điện nước cho phòng này</span>
                </Button>
              </Link>

              <Link href="/invoices" className="w-full">
                <Button variant="primary" className="w-full">
                  <FileText className="h-4 w-4" />
                  <span>Xem lịch sử hóa đơn phòng</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal: Create Room (Zod Validated) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm phòng mới"
        description="Đăng ký thêm số phòng vào cơ sở đang hoạt động"
      >
        <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Tòa nhà / Cơ sở *
            </label>
            <select
              {...registerCreate('propertyId')}
              className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-sm bg-white focus:outline-none focus:border-indigo-600"
            >
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errorsCreate.propertyId && (
              <p className="text-xs text-rose-600 mt-1">{errorsCreate.propertyId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số/Tên phòng *
              </label>
              <Input
                {...registerCreate('roomCode')}
                placeholder="VD: P.204"
                error={errorsCreate.roomCode?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Tầng *
              </label>
              <Input
                type="number"
                {...registerCreate('floor')}
                min={0}
                error={errorsCreate.floor?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Giá thuê (₫/tháng) *
              </label>
              <Input
                type="number"
                {...registerCreate('baseRent')}
                isNumericTabular
                error={errorsCreate.baseRent?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Diện tích (m²)
              </label>
              <Input
                type="number"
                {...registerCreate('areaM2')}
                error={errorsCreate.areaM2?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số người tối đa
              </label>
              <Input
                type="number"
                {...registerCreate('maxOccupants')}
                min={1}
                error={errorsCreate.maxOccupants?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ghi chú nội thất
              </label>
              <Input
                {...registerCreate('notes')}
                placeholder="VD: Máy lạnh, gác lửng"
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
              isLoading={createRoomMutation.isPending}
            >
              Tạo phòng
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Room (Zod Validated) */}
      <Modal
        isOpen={Boolean(editingRoom)}
        onClose={() => setEditingRoom(null)}
        title={`Chỉnh sửa phòng ${editingRoom?.roomCode}`}
        description="Cập nhật giá thuê, số tầng hoặc diện tích phòng"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <input type="hidden" {...registerEdit('propertyId')} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số/Tên phòng *
              </label>
              <Input
                {...registerEdit('roomCode')}
                error={errorsEdit.roomCode?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Tầng *
              </label>
              <Input
                type="number"
                {...registerEdit('floor')}
                min={0}
                error={errorsEdit.floor?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Giá thuê niêm yết (₫) *
              </label>
              <Input
                type="number"
                {...registerEdit('baseRent')}
                isNumericTabular
                error={errorsEdit.baseRent?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Diện tích (m²)
              </label>
              <Input
                type="number"
                {...registerEdit('areaM2')}
                error={errorsEdit.areaM2?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số người tối đa
              </label>
              <Input
                type="number"
                {...registerEdit('maxOccupants')}
                min={1}
                error={errorsEdit.maxOccupants?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ghi chú
              </label>
              <Input
                {...registerEdit('notes')}
                placeholder="VD: Cửa sổ thoáng, mới sơn"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingRoom(null)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateRoomMutation.isPending}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deletingRoom)}
        onClose={() => setDeletingRoom(null)}
        title="Xác nhận xóa phòng"
        description={`Bạn có chắc chắn muốn xóa phòng ${deletingRoom?.roomCode}?`}
      >
        <div className="space-y-4">
          {deletingRoom?.status === 'occupied' ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[10px] text-xs text-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cảnh báo:</strong> Phòng này hiện đang có khách thuê (
                <span className="font-semibold">{deletingRoom.currentTenant?.fullName}</span>).
                Xóa phòng sẽ đồng thời hủy liên kết hợp đồng thuê hiện tại.
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Hành động này sẽ gỡ bỏ phòng khỏi cơ sở dữ liệu và không thể hoàn tác.
            </p>
          )}

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingRoom(null)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleteRoomMutation.isPending}
            >
              Xác nhận xóa phòng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
