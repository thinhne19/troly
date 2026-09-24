'use client';

// app/(dashboard)/settings/page.tsx — Settings & Pricing Configuration
import * as React from 'react';
import {
  Settings,
  Zap,
  CreditCard,
  Building,
  User,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { usePropertyStore } from '@/stores/use-property-store';
import { useUtilityRates } from '@/hooks/use-properties';
import { dataAdapter } from '@/lib/data-adapter';
import { VIETNAMESE_BANKS } from '@/lib/vietqr';

export default function SettingsPage() {
  const { selectedPropertyId } = usePropertyStore();
  const { data: rates } = useUtilityRates(selectedPropertyId);

  const [activeTab, setActiveTab] = React.useState('utilities');
  const [isSaved, setIsSaved] = React.useState(false);

  // Utility rates state
  const [electricRate, setElectricRate] = React.useState(3800);
  const [waterRate, setWaterRate] = React.useState(18000);
  const [internetFee, setInternetFee] = React.useState(100000);
  const [garbageFee, setGarbageFee] = React.useState(50000);
  const [parkingFee, setParkingFee] = React.useState(100000);

  // Bank & VietQR state
  const [bankId, setBankId] = React.useState('MB');
  const [accountNo, setAccountNo] = React.useState('999908123456');
  const [accountName, setAccountName] = React.useState('NGUYEN VAN THIN');

  React.useEffect(() => {
    if (rates) {
      setElectricRate(rates.electricRate);
      setWaterRate(rates.waterRate);
      setInternetFee(rates.internetFee);
      setGarbageFee(rates.garbageFee);
      setParkingFee(rates.parkingFeeMotorbike);
    }
  }, [rates]);

  const handleSaveUtilities = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataAdapter.updateUtilityRates(selectedPropertyId, {
      electricRate: Number(electricRate),
      waterRate: Number(waterRate),
      internetFee: Number(internetFee),
      garbageFee: Number(garbageFee),
      parkingFeeMotorbike: Number(parkingFee),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetSeed = async () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục lại dữ liệu mẫu ban đầu?')) {
      await dataAdapter.resetToSeedData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cấu hình Hệ thống & Bảng giá
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập đơn giá dịch vụ điện nước, tài khoản VietQR và thông tin chủ nhà
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[12px] flex items-center gap-2.5 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Cấu hình đã được lưu thành công!</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'utilities', label: 'Bảng giá dịch vụ & Điện nước', icon: <Zap className="h-4 w-4 text-amber-500" /> },
          { id: 'banking', label: 'Tài khoản VietQR & Ngân hàng', icon: <CreditCard className="h-4 w-4 text-indigo-600" /> },
          { id: 'system', label: 'Hệ thống & Dữ liệu', icon: <Settings className="h-4 w-4 text-slate-500" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Utilities Pricing */}
      {activeTab === 'utilities' && (
        <div className="bg-white border border-slate-200 rounded-[12px] p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Đơn giá áp dụng cho cơ sở hiện tại</h2>

          <form onSubmit={handleSaveUtilities} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Đơn giá Điện (₫/kWh) *
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
                  Đơn giá Nước (₫/m³) *
                </label>
                <Input
                  type="number"
                  value={waterRate}
                  onChange={(e) => setWaterRate(Number(e.target.value))}
                  isNumericTabular
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phí Internet / Wifi (₫/phòng)
                </label>
                <Input
                  type="number"
                  value={internetFee}
                  onChange={(e) => setInternetFee(Number(e.target.value))}
                  isNumericTabular
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phí Rác & Vệ sinh chung (₫/phòng)
                </label>
                <Input
                  type="number"
                  value={garbageFee}
                  onChange={(e) => setGarbageFee(Number(e.target.value))}
                  isNumericTabular
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phí Gửi xe máy (₫/xe)
                </label>
                <Input
                  type="number"
                  value={parkingFee}
                  onChange={(e) => setParkingFee(Number(e.target.value))}
                  isNumericTabular
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                <Save className="h-4 w-4" />
                <span>Lưu thay đổi biểu phí</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Bank & VietQR Configuration */}
      {activeTab === 'banking' && (
        <div className="bg-white border border-slate-200 rounded-[12px] p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Tài khoản thụ hưởng chuyển khoản VietQR</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Ngân hàng thụ hưởng
              </label>
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                className="w-full h-10 px-3 rounded-[10px] border border-slate-200 text-sm bg-white focus:outline-none focus:border-indigo-600"
              >
                {VIETNAMESE_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Số tài khoản ngân hàng *
                </label>
                <Input
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="999908123456"
                  isNumericTabular
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tên chủ tài khoản (Viết hoa không dấu) *
                </label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="NGUYEN VAN THIN"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px] text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Cú pháp chuyển khoản tự động:</span>{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-slate-900">
                TROLY [SỐ_PHÒNG] [THÁNG]
              </code>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={() => alert('Cấu hình VietQR đã được lưu!')} variant="primary" size="md">
                <Save className="h-4 w-4" />
                <span>Lưu thông tin ngân hàng</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System & Demo Data Reset */}
      {activeTab === 'system' && (
        <div className="bg-white border border-slate-200 rounded-[12px] p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Khôi phục & Thiết lập lại</h2>
            <p className="text-xs text-slate-500 mt-1">
              Khôi phục lại bộ dữ liệu 3 tòa nhà và 48 phòng trọ mẫu chuẩn
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-[10px] flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">Dữ liệu thử nghiệm (Seed Data)</div>
              <div className="text-xs text-slate-500">
                Khôi phục về trạng thái ban đầu để kiểm thử tất cả các quy trình
              </div>
            </div>
            <Button onClick={handleResetSeed} variant="secondary" size="sm">
              <RotateCcw className="h-4 w-4 text-slate-600 mr-1" />
              <span>Khôi phục dữ liệu mẫu</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
