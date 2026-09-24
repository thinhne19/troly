// stores/use-meter-draft-store.ts — Ephemeral Grid Buffer for Fast Reading Input
import { create } from 'zustand';

export interface MeterDraftEntry {
  roomId: string;
  electricCurrent: number | string;
  waterCurrent: number | string;
  electricPrevious: number;
  waterPrevious: number;
}

interface MeterDraftState {
  drafts: Record<string, MeterDraftEntry>; // keyed by roomId
  setDraft: (roomId: string, entry: Partial<MeterDraftEntry>) => void;
  initializeDrafts: (entries: MeterDraftEntry[]) => void;
  clearDrafts: () => void;
}

export const useMeterDraftStore = create<MeterDraftState>((set) => ({
  drafts: {},
  setDraft: (roomId, entry) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [roomId]: {
          ...(state.drafts[roomId] || {
            roomId,
            electricCurrent: '',
            waterCurrent: '',
            electricPrevious: 0,
            waterPrevious: 0,
          }),
          ...entry,
        },
      },
    })),
  initializeDrafts: (entries) => {
    const map: Record<string, MeterDraftEntry> = {};
    entries.forEach((e) => {
      map[e.roomId] = e;
    });
    set({ drafts: map });
  },
  clearDrafts: () => set({ drafts: {} }),
}));
