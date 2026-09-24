'use client';

// components/layout/bottom-nav.tsx — Mobile PWA Fixed Bottom Navigation Bar (64px)
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, DoorOpen, Zap, Receipt, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
    { name: 'Phòng', href: '/rooms', icon: DoorOpen },
    { name: 'Ghi số', href: '/meter-readings', icon: Zap },
    { name: 'Hóa đơn', href: '/invoices', icon: Receipt },
    { name: 'Tòa nhà', href: '/properties', icon: Building2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-30 flex items-center justify-around px-2 select-none shadow-md">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2 rounded-[8px] transition-colors',
              isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] leading-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
