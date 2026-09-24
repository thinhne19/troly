'use client';

// components/layout/top-nav.tsx — Top Navigation Bar with Dynamic Active Property Switcher
import * as React from 'react';
import { Search, Bell, Menu, Building2, ChevronDown } from 'lucide-react';
import { useUIStore } from '@/stores/use-ui-store';
import { usePropertyStore } from '@/stores/use-property-store';
import { useProperties } from '@/hooks/use-properties';
import { useAuthProfile } from '@/hooks/use-auth';
import { isSupabaseConfigured } from '@/lib/data-adapter';
import { useInvoices } from '@/hooks/use-invoices';

export function TopNav() {
  const { setMobileSidebarOpen } = useUIStore();
  const { selectedPropertyId, setSelectedPropertyId, selectedMonth } = usePropertyStore();
  const { data: properties } = useProperties();
  const { data: profile } = useAuthProfile();
  const { data: invoices } = useInvoices(selectedPropertyId, selectedMonth);

  const isSupabase = isSupabaseConfigured();
  const overdueCount = invoices?.filter((i) => i.paymentStatus === 'overdue').length || 0;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Hamburger & Brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-[8px] text-slate-600 hover:bg-slate-100"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-slate-900 tracking-tight text-base">Troly</span>
      </div>

      {/* Global Quick Search (Desktop) */}
      <div className="hidden sm:flex items-center w-72 md:w-80">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm phòng, khách thuê, số CCCD... (Cmd+K)"
            className="w-full h-8 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-[8px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Property Switcher (Top Nav Fast Access) */}
        <div className="flex items-center relative">
          <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-[8px] transition-colors">
            <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              suppressHydrationWarning
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-4 appearance-none truncate max-w-[140px] sm:max-w-[200px]"
            >
              <option value="all">Tất cả cơ sở (48 phòng)</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Environment Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-slate-50 border-slate-200 text-slate-600">
          <span
            className={`h-2 w-2 rounded-full ${
              isSupabase ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span>{isSupabase ? 'Supabase Live' : 'Demo Mode'}</span>
        </div>

        {/* Notifications (Overdue Invoices Indicator) */}
        <button
          className="relative p-2 rounded-[8px] text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title={`${overdueCount} hóa đơn quá hạn cần thu`}
        >
          <Bell className="h-4 w-4" />
          {overdueCount > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
              {overdueCount}
            </span>
          )}
        </button>

        {/* Landlord Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 shrink-0">
            {profile?.fullName
              ? profile.fullName
                  .split(' ')
                  .slice(-1)[0]
                  ?.charAt(0)
                  .toUpperCase()
              : 'T'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none">
              {profile?.fullName || 'Nguyễn Văn Thìn'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {profile?.phone || '0908 123 456'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
