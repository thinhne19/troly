// stores/use-ui-store.ts — UI Dialogs, Drawers & Mobile Navigation
import { create } from 'zustand';

interface UIState {
  isMobileSidebarOpen: boolean;
  isCmdKOpen: boolean;
  activeTenantDrawerId: string | null;
  activeInvoiceDrawerId: string | null;
  isNewPropertyModalOpen: boolean;
  isNewRoomModalOpen: boolean;
  isNewTenantModalOpen: boolean;
  isRecordPaymentModalOpen: boolean;
  paymentTargetInvoiceId: string | null;

  setMobileSidebarOpen: (open: boolean) => void;
  setCmdKOpen: (open: boolean) => void;
  setActiveTenantDrawerId: (id: string | null) => void;
  setActiveInvoiceDrawerId: (id: string | null) => void;
  setNewPropertyModalOpen: (open: boolean) => void;
  setNewRoomModalOpen: (open: boolean) => void;
  setNewTenantModalOpen: (open: boolean) => void;
  openPaymentModal: (invoiceId: string) => void;
  closePaymentModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileSidebarOpen: false,
  isCmdKOpen: false,
  activeTenantDrawerId: null,
  activeInvoiceDrawerId: null,
  isNewPropertyModalOpen: false,
  isNewRoomModalOpen: false,
  isNewTenantModalOpen: false,
  isRecordPaymentModalOpen: false,
  paymentTargetInvoiceId: null,

  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  setCmdKOpen: (open) => set({ isCmdKOpen: open }),
  setActiveTenantDrawerId: (id) => set({ activeTenantDrawerId: id }),
  setActiveInvoiceDrawerId: (id) => set({ activeInvoiceDrawerId: id }),
  setNewPropertyModalOpen: (open) => set({ isNewPropertyModalOpen: open }),
  setNewRoomModalOpen: (open) => set({ isNewRoomModalOpen: open }),
  setNewTenantModalOpen: (open) => set({ isNewTenantModalOpen: open }),
  openPaymentModal: (invoiceId) =>
    set({ isRecordPaymentModalOpen: true, paymentTargetInvoiceId: invoiceId }),
  closePaymentModal: () =>
    set({ isRecordPaymentModalOpen: false, paymentTargetInvoiceId: null }),
}));
