'use client';

// app/(dashboard)/meter-readings/page.tsx — High-Speed Batch Meter Input Grid
import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Droplet,
  Save,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePropertyStore } from '@/stores/use-property-store';
import { useRooms } from '@/hooks/use-rooms';
import { useUtilityRates } from '@/hooks/use-properties';
import { useMeterReadings, useSaveMeterReadings } from '@/hooks/use-meter-readings';
import { useGenerateInvoices } from '@/hooks/use-invoices';
import { formatVND } from '@/lib/utils';
import { useKeyboardGridNav } from '@/hooks/use-keyboard-nav';

export default function MeterReadingsPage() {
  const router = useRouter();
  const { selectedPropertyId, selectedMonth, setSelectedMonth } = usePropertyStore();
  const { data: rooms, isLoading: roomsLoading } = useRooms(selectedPropertyId);
  const { data: rates } = useUtilityRates(selectedPropertyId);
  const { data: existingReadings } = useMeterReadings(selectedPropertyId, selectedMonth);

  const saveMeterReadingsMutation = useSaveMeterReadings();
  const generateInvoicesMutation = useGenerateInvoices();

  // Grid input state: { [roomId]: { electricCurrent: string, waterCurrent: string, isMeterReplaced: boolean } }
  const [gridData, setGridData] = React.useState<
    Record<string, { electricCurrent: string; waterCurrent: string; isMeterReplaced?: boolean }>
  >({});
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Focus management refs for 2 columns (0: Electric, 1: Water) x N rooms
  const inputRefs = React.useRef<(HTMLInputElement | null)[][]>([]);

  // Initialize inputs from existing readings or default
  React.useEffect(() => {
    if (rooms) {
      const initial: Record<
        string,
        { electricCurrent: string; waterCurrent: string; isMeterReplaced?: boolean }
      > = {};
      rooms.forEach((r) => {
        const existing = existingReadings?.find((m) => m.roomId === r.id);
        const lastMonthElec = r.latestMeterReading?.electricCurrent || 1000;
        const lastMonthWater = r.latestMeterReading?.waterCurrent || 20;

        initial[r.id] = {
          electricCurrent: existing ? String(existing.electricCurrent) : String(lastMonthElec + 50),
          waterCurrent: existing ? String(existing.waterCurrent) : String(lastMonthWater + 4),
          isMeterReplaced: false,
        };
      });
      setGridData(initial);
      inputRefs.current = rooms.map(() => [null, null]);
    }
  }, [rooms, existingReadings]);

  const handleCellFocus = React.useCallback((coords: { rowIndex: number; colIndex: number }) => {
    const target = inputRefs.current[coords.rowIndex]?.[coords.colIndex];
    if (target) {
      target.focus();
      target.select();
    }
  }, []);

  const { handleKeyDown } = useKeyboardGridNav(
    rooms?.length || 0,
    2, // 2 input columns: Electric (0), Water (1)
    handleCellFocus
  );

  const handleInputChange = (
    roomId: string,
    field: 'electricCurrent' | 'waterCurrent',
    val: string
  ) => {
    if (!/^\d*\.?\d*$/.test(val)) return;
    setGridData((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: val,
      },
    }));
  };

  const handleToggleMeterReplaced = (roomId: string) => {
    setGridData((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        isMeterReplaced: !prev[roomId]?.isMeterReplaced,
      },
    }));
  };

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

  // Prepare payload
  const buildReadingsPayload = () => {
    if (!rooms) return [];
    return rooms.map((r) => {
      const row = gridData[r.id] || { electricCurrent: '0', waterCurrent: '0' };
      const prevElec = r.latestMeterReading?.electricCurrent || 1000;
      const prevWater = r.latestMeterReading?.waterCurrent || 20;
      const curElec = Number(row.electricCurrent) || prevElec;
      const curWater = Number(row.waterCurrent) || prevWater;

      const electricUsage = row.isMeterReplaced
        ? curElec
        : Math.max(0, curElec - prevElec);
      const waterUsage = row.isMeterReplaced
        ? curWater
        : Math.max(0, curWater - prevWater);

      return {
        propertyId: selectedPropertyId,
        roomId: r.id,
        billingMonth: selectedMonth,
        electricPrevious: prevElec,
        electricCurrent: curElec,
        electricUsage,
        waterPrevious: prevWater,
        waterCurrent: curWater,
        waterUsage,
      };
    });
  };

  // Save only
  const handleSaveOnly = async () => {
    const payload = buildReadingsPayload();
    if (payload.length === 0) return;

    await saveMeterReadingsMutation.mutateAsync(payload);
    setToastMessage('Đã lưu thành công toàn bộ chỉ số điện nước!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save and generate invoices
  const handleSaveAndGenerate = async () => {
    const payload = buildReadingsPayload();
    if (payload.length === 0) return;

    await saveMeterReadingsMutation.mutateAsync(payload);
    await generateInvoicesMutation.mutateAsync({
      propertyId: selectedPropertyId,
      month: selectedMonth,
    });

    setToastMessage('Đã lưu chỉ số và sinh hóa đơn cho toàn bộ phòng thành công!');
    setTimeout(() => {
      setToastMessage(null);
      router.push('/invoices');
    }, 1200);
  };

  const electricPrice = rates?.electricRate || 3800;
  const waterPrice = rates?.waterRate || 18000;

  // Counts
  const totalRooms = rooms?.length || 0;
  let totalElecKwh = 0;
  let totalWaterM3 = 0;
  let totalEstMoney = 0;

  rooms?.forEach((r) => {
    const prevElec = r.latestMeterReading?.electricCurrent || 1000;
    const prevWater = r.latestMeterReading?.waterCurrent || 20;
    const row = gridData[r.id];
    const curElec = row ? Number(row.electricCurrent) || prevElec : prevElec;
    const curWater = row ? Number(row.waterCurrent) || prevWater : prevWater;
    const elecDiff = row?.isMeterReplaced ? curElec : Math.max(0, curElec - prevElec);
    const waterDiff = row?.isMeterReplaced ? curWater : Math.max(0, curWater - prevWater);

    totalElecKwh += elecDiff;
    totalWaterM3 += waterDiff;
    totalEstMoney += elecDiff * electricPrice + waterDiff * waterPrice;
  });

  return (
    <div className="space-y-6">
      {/* Header with Month Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Ghi chỉ số Điện & Nước</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
              Kỳ {selectedMonth}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đơn giá: Điện <span className="font-semibold text-slate-700">{formatVND(electricPrice)}/kWh</span> • Nước <span className="font-semibold text-slate-700">{formatVND(waterPrice)}/m³</span>
          </p>
        </div>

        {/* Action Controls */}
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
            onClick={handleSaveOnly}
            variant="secondary"
            size="md"
            isLoading={saveMeterReadingsMutation.isPending}
          >
            <Save className="h-4 w-4" />
            <span>Lưu chỉ số</span>
          </Button>

          <Button
            onClick={handleSaveAndGenerate}
            variant="primary"
            size="md"
            isLoading={
              saveMeterReadingsMutation.isPending || generateInvoicesMutation.isPending
            }
            className="shadow-sm"
          >
            <FileCheck className="h-4 w-4" />
            <span>Lưu & Sinh hóa đơn</span>
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

      {/* Summary Aggregate Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Số phòng cần ghi
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalRooms} phòng
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Tổng điện tiêu thụ
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums font-mono">
            {totalElecKwh.toLocaleString('vi-VN')} kWh
          </div>
        </div>

        <div className="bg-white border border-sky-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider flex items-center gap-1">
            <Droplet className="h-3.5 w-3.5 text-sky-500" />
            Tổng nước tiêu thụ
          </span>
          <div className="text-xl font-bold text-sky-700 mt-1 tabular-nums font-mono">
            {totalWaterM3.toLocaleString('vi-VN')} m³
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-[10px] p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Tạm tính tiền dịch vụ
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {formatVND(totalEstMoney)}
          </div>
        </div>
      </div>

      {/* Ergonomic Keyboard Shortcut Ribbon */}
      <div className="bg-slate-50 px-4 py-2.5 rounded-[10px] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="font-mono bg-white px-2 py-0.5 rounded-[4px] border border-slate-200 font-bold text-slate-800">
            Tab
          </span>
          chuyển giữa Điện và Nước
          <span className="mx-1">•</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded-[4px] border border-slate-200 font-bold text-slate-800">
            Enter
          </span>
          xuống phòng tiếp theo
          <span className="mx-1">•</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded-[4px] border border-slate-200 font-bold text-slate-800">
            ↑ / ↓
          </span>
          di chuyển hàng
        </span>
        <span className="text-slate-400 text-[11px]">
          Tự động phát hiện chỉ số âm và cảnh báo tiêu thụ bất thường
        </span>
      </div>

      {/* Batch Entry Table */}
      <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr className="h-11">
                <th className="px-4 py-2 w-28">Phòng</th>
                <th className="px-3 py-2 text-right">Điện cũ</th>
                <th className="px-3 py-2 text-left w-36">Điện mới (kWh)</th>
                <th className="px-3 py-2 text-center">Tiêu thụ điện</th>
                <th className="px-3 py-2 text-right">Nước cũ</th>
                <th className="px-3 py-2 text-left w-36">Nước mới (m³)</th>
                <th className="px-3 py-2 text-center">Tiêu thụ nước</th>
                <th className="px-4 py-2 text-right">Tạm tính điện nước</th>
                <th className="px-4 py-2 text-center">Kiểm tra</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rooms?.map((room, rowIndex) => {
                const prevElec = room.latestMeterReading?.electricCurrent || 1000;
                const prevWater = room.latestMeterReading?.waterCurrent || 20;
                const row = gridData[room.id] || {
                  electricCurrent: String(prevElec),
                  waterCurrent: String(prevWater),
                  isMeterReplaced: false,
                };

                const curElec = Number(row.electricCurrent) || prevElec;
                const curWater = Number(row.waterCurrent) || prevWater;

                const rawElecDiff = curElec - prevElec;
                const rawWaterDiff = curWater - prevWater;

                const isElecInvalid = rawElecDiff < 0 && !row.isMeterReplaced;
                const isWaterInvalid = rawWaterDiff < 0 && !row.isMeterReplaced;
                const isAnomaly = isElecInvalid || isWaterInvalid;

                const elecUsage = row.isMeterReplaced ? curElec : Math.max(0, rawElecDiff);
                const waterUsage = row.isMeterReplaced ? curWater : Math.max(0, rawWaterDiff);

                const estElec = elecUsage * electricPrice;
                const estWater = waterUsage * waterPrice;
                const estSubtotal = estElec + estWater;

                return (
                  <tr
                    key={room.id}
                    className={`h-14 transition-colors ${
                      isAnomaly
                        ? 'bg-amber-50/50 hover:bg-amber-50/80'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Room Info */}
                    <td className="px-4 py-2">
                      <span className="font-bold text-slate-900">{room.roomCode}</span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {room.currentTenant?.fullName || 'Phòng trống'}
                      </div>
                    </td>

                    {/* Electric Previous */}
                    <td className="px-3 py-2 text-right font-mono text-slate-500 tabular-nums text-xs">
                      {prevElec}
                    </td>

                    {/* Electric Current Input */}
                    <td className="px-3 py-2">
                      <div className="relative">
                        <input
                          ref={(el) => {
                            if (inputRefs.current[rowIndex]) {
                              inputRefs.current[rowIndex][0] = el;
                            }
                          }}
                          type="text"
                          value={row.electricCurrent}
                          onChange={(e) =>
                            handleInputChange(room.id, 'electricCurrent', e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                          className={`w-full h-9 px-2.5 rounded-[8px] border text-xs font-mono font-bold tabular-nums text-slate-900 focus:outline-none transition-all ${
                            isElecInvalid
                              ? 'border-amber-400 bg-amber-50 focus:border-amber-600 focus:ring-1 focus:ring-amber-500'
                              : 'border-slate-200 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                          }`}
                        />
                        {isElecInvalid && (
                          <span
                            title="Số mới nhỏ hơn số cũ! Bấm vào 'Thay đồng hồ' nếu vừa thay mới."
                            className="absolute right-2 top-2.5 pointer-events-none text-amber-500"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Electric Usage */}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold text-xs tabular-nums ${
                          isElecInvalid
                            ? 'text-amber-700'
                            : elecUsage > 200
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        <Zap className="h-3 w-3 text-amber-500" />
                        {elecUsage} kWh
                      </span>
                    </td>

                    {/* Water Previous */}
                    <td className="px-3 py-2 text-right font-mono text-slate-500 tabular-nums text-xs">
                      {prevWater}
                    </td>

                    {/* Water Current Input */}
                    <td className="px-3 py-2">
                      <div className="relative">
                        <input
                          ref={(el) => {
                            if (inputRefs.current[rowIndex]) {
                              inputRefs.current[rowIndex][1] = el;
                            }
                          }}
                          type="text"
                          value={row.waterCurrent}
                          onChange={(e) =>
                            handleInputChange(room.id, 'waterCurrent', e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                          className={`w-full h-9 px-2.5 rounded-[8px] border text-xs font-mono font-bold tabular-nums text-slate-900 focus:outline-none transition-all ${
                            isWaterInvalid
                              ? 'border-amber-400 bg-amber-50 focus:border-amber-600 focus:ring-1 focus:ring-amber-500'
                              : 'border-slate-200 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Water Usage */}
                    <td className="px-3 py-2 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-slate-800 tabular-nums">
                        <Droplet className="h-3 w-3 text-sky-500" />
                        {waterUsage} m³
                      </span>
                    </td>

                    {/* Subtotal */}
                    <td className="px-4 py-2 text-right font-bold text-slate-900 tabular-nums text-xs">
                      {formatVND(estSubtotal)}
                    </td>

                    {/* Validation & Anomaly Override */}
                    <td className="px-4 py-2 text-center">
                      {isAnomaly ? (
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="warning" size="sm">
                            Số mới &lt; Số cũ
                          </Badge>
                          <label className="flex items-center gap-1 text-[10px] text-amber-800 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(row.isMeterReplaced)}
                              onChange={() => handleToggleMeterReplaced(room.id)}
                              className="h-3 w-3 rounded text-amber-600"
                            />
                            <span>Đã thay mới</span>
                          </label>
                        </div>
                      ) : (
                        <Badge variant="success" size="sm">
                          Hợp lệ ✓
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
