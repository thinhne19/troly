'use client';

// app/(dashboard)/page.tsx — Executive Dashboard (100% Calculated from Repository Data)
import * as React from 'react';
import Link from 'next/link';
import {
  Banknote,
  DoorOpen,
  Receipt,
  Percent,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatVND } from '@/lib/utils';
import { useDashboardSummary, useRevenueTrend } from '@/hooks/use-analytics';
import { usePropertyStore } from '@/stores/use-property-store';
import { useInvoices } from '@/hooks/use-invoices';
import { useProperties } from '@/hooks/use-properties';
import { useMounted } from '@/hooks/use-mounted';

export default function DashboardPage() {
  const mounted = useMounted();
  const { selectedPropertyId, selectedMonth } = usePropertyStore();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(selectedPropertyId, selectedMonth);
  const { data: trendData, isLoading: trendLoading } = useRevenueTrend(selectedPropertyId);
  const { data: invoices, isLoading: invoicesLoading } = useInvoices(selectedPropertyId, selectedMonth);
  const { data: properties } = useProperties();

  const currentProperty = properties?.find((p) => p.id === selectedPropertyId);
  const currentPropertyName = !mounted
    ? 'Cơ sở cho thuê'
    : selectedPropertyId === 'all'
    ? 'Tất cả 3 cơ sở'
    : currentProperty?.name || 'Cơ sở cho thuê';

  const pendingInvoices = invoices?.filter((i) => i.paymentStatus !== 'paid') || [];
  const paidInvoices = invoices?.filter((i) => i.paymentStatus === 'paid') || [];

  return (
    <div className="space-y-6">
      {/* Page Header with Real Property Filter Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tổng quan điều hành
          </h1>
          <p className="text-xs text-slate-500 mt-1" suppressHydrationWarning>
            Đang xem:{' '}
            <span className="font-semibold text-slate-800" suppressHydrationWarning>
              {currentPropertyName}
            </span>{' '}
            • Chu kỳ <span suppressHydrationWarning>{selectedMonth}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/meter-readings">
            <Button variant="secondary" size="md">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Ghi điện nước</span>
            </Button>
          </Link>
          <Link href="/invoices">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" />
              <span>Lập hóa đơn</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards (100% Calculated from Repository) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Monthly Revenue */}
        <StatCard
          title="Doanh thu tháng này"
          value={summary ? formatVND(summary.monthlyRevenue) : '...'}
          trend={
            summary
              ? {
                  value: `${summary.revenueGrowthPct >= 0 ? '+' : ''}${summary.revenueGrowthPct}% so T-1`,
                  isPositive: summary.revenueGrowthPct >= 0,
                }
              : undefined
          }
          icon={Banknote}
          progress={
            summary
              ? {
                  current: summary.collectedRevenue,
                  total: summary.monthlyRevenue > 0 ? summary.monthlyRevenue : 1,
                  label: `Đã thu: ${formatVND(summary.collectedRevenue)}`,
                }
              : undefined
          }
        />

        {/* 2. Occupancy Rate */}
        <StatCard
          title="Tỷ lệ lấp đầy"
          value={summary ? `${summary.occupancyRate.toFixed(1)}%` : '...'}
          subValue={
            summary
              ? `${summary.occupiedRooms}/${summary.totalRooms} phòng đang thuê`
              : 'Đang tải...'
          }
          icon={DoorOpen}
          iconColor="text-emerald-600 bg-emerald-50"
        />

        {/* 3. Outstanding Invoices */}
        <StatCard
          title="Hóa đơn chưa thu"
          value={summary ? `${summary.pendingInvoicesCount} phòng` : '...'}
          subValue={summary ? `Còn nợ: ${formatVND(summary.uncollectedRevenue)}` : '...'}
          trend={
            summary && summary.overdueInvoicesCount > 0
              ? {
                  value: `${summary.overdueInvoicesCount} phòng quá hạn`,
                  isPositive: false,
                }
              : undefined
          }
          icon={Receipt}
          iconColor="text-amber-600 bg-amber-50"
        />

        {/* 4. Collection Rate */}
        <StatCard
          title="Tỷ lệ thu hồi tiền"
          value={summary ? `${summary.collectionRatePct.toFixed(1)}%` : '...'}
          subValue={
            summary
              ? `Đã thu ${summary.occupiedRooms - summary.pendingInvoicesCount}/${summary.occupiedRooms} phòng`
              : 'Đang tính toán...'
          }
          icon={Percent}
          iconColor="text-sky-600 bg-sky-50"
        />
      </div>

      {/* Charts Section (100% Calculated from Repository) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend 6 Months (Stacked Bar from Invoices) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[12px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Doanh thu 6 tháng qua
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp từ hóa đơn thực tế trong cơ sở dữ liệu (VND)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-[2px] bg-indigo-600" />
                Tiền phòng
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-[2px] bg-amber-400" />
                Điện
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-[2px] bg-sky-500" />
                Nước
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {trendLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Đang tải dữ liệu biểu đồ...
              </div>
            ) : trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatVND(Number(value)), '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="rent" stackId="a" fill="#4F46E5" />
                  <Bar dataKey="electric" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="water" stackId="a" fill="#0284C7" />
                  <Bar dataKey="service" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Occupancy Donut Chart (Dynamic) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[12px] p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Tỷ lệ lấp đầy</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ phòng đang thuê vs phòng trống
            </p>

            <div className="h-52 w-full mt-2">
              {summary && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Đang thuê', value: summary.occupiedRooms },
                        { name: 'Phòng trống', value: summary.vacantRooms },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="#4F46E5" />
                      <Cell fill="#CBD5E1" />
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} phòng`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                Đang thuê
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {summary?.occupiedRooms ?? 0} phòng ({summary ? summary.occupancyRate.toFixed(1) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Phòng trống
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {summary?.vacantRooms ?? 0} phòng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Outstanding Invoices & Repository Live Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Outstanding Invoices List (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[12px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Hóa đơn chưa thu ({pendingInvoices.length})
              </h2>
              <p className="text-xs text-slate-500">
                Danh sách phòng cần thu tiền kỳ {selectedMonth}
              </p>
            </div>
            <Link
              href="/invoices"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {invoicesLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Đang tải hóa đơn...</div>
          ) : pendingInvoices.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-600 font-medium">
              Tất cả các phòng đã thanh toán đủ tiền kỳ này! ✓
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingInvoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-[8px] bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                      {inv.room?.roomCode || 'P.??'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {inv.tenant?.fullName || 'Khách thuê'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Hạn đóng: {inv.dueDate}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatVND(inv.balanceDue)}
                    </div>
                    <Badge
                      variant={inv.paymentStatus === 'overdue' ? 'error' : 'warning'}
                      size="sm"
                      dot
                    >
                      {inv.paymentStatus === 'overdue' ? 'Quá hạn' : 'Chưa thu'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activities Derived from Recent Paid Invoices in Repository (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[12px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Thu tiền gần đây</h2>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Khớp tự động
            </span>
          </div>

          <div className="space-y-4">
            {paidInvoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="flex items-start gap-3">
                <div className="p-2 rounded-[8px] bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-800">
                    Phòng {inv.room?.roomCode} ({inv.tenant?.fullName})
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Đã thanh toán VietQR:{' '}
                    <span className="font-semibold text-emerald-600 tabular-nums">
                      {formatVND(inv.amountPaid)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Hóa đơn {inv.invoiceCode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
