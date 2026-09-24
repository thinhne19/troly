'use client';

// app/(dashboard)/properties/page.tsx — Properties Module (Card & Table View)
import * as React from 'react';
import {
  Building2,
  Plus,
  LayoutGrid,
  List,
  MapPin,
  DoorOpen,
  Banknote,
  Zap,
  Droplet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import { useProperties, useCreateProperty } from '@/hooks/use-properties';
import { formatVND } from '@/lib/utils';
import { Property } from '@/types/models';

export default function PropertiesPage() {
  const { data: properties, isLoading } = useProperties();
  const createProperty = useCreateProperty();

  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [totalFloors, setTotalFloors] = React.useState(3);
  const [electricRate, setElectricRate] = React.useState(3800);
  const [waterRate, setWaterRate] = React.useState(18000);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    await createProperty.mutateAsync({
      property: {
        userId: 'usr-landlord-001',
        name,
        address,
        totalFloors: Number(totalFloors),
      },
      rates: {
        electricRate: Number(electricRate),
        waterRate: Number(waterRate),
      },
    });

    setIsModalOpen(false);
    setName('');
    setAddress('');
  };

  const columns: Column<Property>[] = [
    {
      header: 'Tên cơ sở',
      accessorKey: 'name',
      cell: (row) => (
        <div className="font-semibold text-slate-900">{row.name}</div>
      ),
    },
    {
      header: 'Địa chỉ',
      accessorKey: 'address',
      cell: (row) => (
        <div className="text-slate-500 truncate max-w-xs">{row.address}</div>
      ),
    },
    {
      header: 'Số tầng',
      accessorKey: 'totalFloors',
      align: 'center',
    },
    {
      header: 'Số phòng',
      accessorKey: 'totalRooms',
      align: 'center',
      cell: (row) => (
        <span className="font-semibold text-slate-800 tabular-nums">
          {row.totalRooms || 0} phòng
        </span>
      ),
    },
    {
      header: 'Tỷ lệ lấp đầy',
      align: 'center',
      cell: (row) => {
        const total = row.totalRooms || 1;
        const occ = row.occupiedRooms || 0;
        const pct = Math.round((occ / total) * 100);
        return (
          <Badge variant={pct >= 90 ? 'success' : 'neutral'} size="sm">
            {occ}/{total} ({pct}%)
          </Badge>
        );
      },
    },
    {
      header: 'Doanh thu tháng',
      align: 'right',
      cell: (row) => (
        <span className="font-bold text-slate-900 tabular-nums">
          {formatVND(row.monthlyRevenue || 0)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with View Toggle & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Danh mục Tòa nhà & Nhà trọ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tất cả cơ sở cho thuê, biểu giá điện nước và hợp đồng
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-[10px] gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[8px] transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Dạng lưới thẻ"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-[8px] transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Dạng bảng chi tiết"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
            <Plus className="h-4 w-4" />
            <span>Thêm tòa nhà</span>
          </Button>
        </div>
      </div>

      {/* Content Rendering */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((prop) => {
            const total = prop.totalRooms || 1;
            const occ = prop.occupiedRooms || 0;
            const pct = Math.round((occ / total) * 100);

            return (
              <div
                key={prop.id}
                className="bg-white border border-slate-200 rounded-[12px] p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-[10px] bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <Badge variant={pct >= 90 ? 'success' : 'neutral'} dot>
                      {occ}/{total} Phòng đầy
                    </Badge>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900 line-clamp-1">
                    {prop.name}
                  </h3>
                  <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-500 line-clamp-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{prop.address}</span>
                  </div>

                  {/* Property Quick Metrics */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Doanh thu dự kiến</span>
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatVND(prop.monthlyRevenue || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Quy mô</span>
                      <div className="text-sm font-bold text-slate-900">
                        {prop.totalFloors} Tầng • {prop.totalRooms} Phòng
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-indigo-600 font-semibold hover:underline cursor-pointer">
                    Quản lý phòng →
                  </span>
                  <span className="text-slate-400">ID: {prop.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={properties || []}
          keyExtractor={(p) => p.id}
          isLoading={isLoading}
        />
      )}

      {/* New Property Modal (16px Radius) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm tòa nhà / nhà trọ mới"
        description="Khởi tạo cơ sở cho thuê mới cùng biểu phí dịch vụ cơ bản"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Tên tòa nhà / Ký túc xá *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nhà trọ Xanh 128 Lê Văn Sỹ"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Địa chỉ chi tiết *
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, phường, quận, TP"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số tầng
              </label>
              <Input
                type="number"
                value={totalFloors}
                onChange={(e) => setTotalFloors(Number(e.target.value))}
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Giá điện (₫/kWh)
              </label>
              <Input
                type="number"
                value={electricRate}
                onChange={(e) => setElectricRate(Number(e.target.value))}
                isNumericTabular
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Giá nước (₫/m³)
              </label>
              <Input
                type="number"
                value={waterRate}
                onChange={(e) => setWaterRate(Number(e.target.value))}
                isNumericTabular
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={createProperty.isPending}>
              Tạo cơ sở mới
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
