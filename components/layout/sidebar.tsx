'use client';

// components/layout/sidebar.tsx — Linear-Style 240px Sidebar (Locked 8 Modules)
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  Zap,
  Receipt,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProperties } from '@/hooks/use-properties';
import { usePropertyStore } from '@/stores/use-property-store';

export const NAVIGATION_MODULES = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Tòa nhà', href: '/properties', icon: Building2 },
  { name: 'Quản lý phòng', href: '/rooms', icon: DoorOpen },
  { name: 'Khách thuê', href: '/tenants', icon: Users },
  { name: 'Ghi điện nước', href: '/meter-readings', icon: Zap },
  { name: 'Hóa đơn & Thu', href: '/invoices', icon: Receipt },
  { name: 'Sổ quỹ & Thu chi', href: '/payments', icon: CreditCard },
  { name: 'Báo cáo', href: '/analytics', icon: BarChart3 },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: properties } = useProperties();
  const { selectedPropertyId, setSelectedPropertyId } = usePropertyStore();

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center gap-2.5 border-b border-slate-100">
        <div className="h-8 w-8 rounded-[8px] bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
          T
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-base">Troly</span>
          <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full">
            v1.0
          </span>
        </div>
      </div>

      {/* Property Switcher */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-100">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 block mb-1">
          Tòa nhà hoạt động
        </label>
        <div className="relative">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            suppressHydrationWarning
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 cursor-pointer appearance-none truncate pr-6"
          >
            <option value="all">Tất cả cơ sở (48 phòng)</option>
            {properties?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Navigation Modules (Strict 8 Primary Modules) */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
          Quản lý chính
        </div>
        {NAVIGATION_MODULES.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 text-sm font-medium rounded-[8px] transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Meta & Support */}
      <div className="p-3 border-t border-slate-100">
        <a
          href="https://zalo.me"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-[8px] hover:bg-slate-50 transition-colors"
        >
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span>Hỗ trợ kỹ thuật (Zalo)</span>
        </a>
      </div>
    </aside>
  );
}
