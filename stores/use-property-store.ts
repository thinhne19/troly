// stores/use-property-store.ts — Active Property & Time Scope State
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PropertyState {
  selectedPropertyId: string; // 'all' or specific property ID
  selectedMonth: string; // 'YYYY-MM'
  setSelectedPropertyId: (id: string) => void;
  setSelectedMonth: (month: string) => void;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set) => ({
      selectedPropertyId: 'prop-001', // Default to first property
      selectedMonth: '2026-09',
      setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
    }),
    {
      name: 'troly-active-property',
    }
  )
);
