import type { KalenderStore } from '#/types/kalender';
import { create } from 'zustand';

export const useKalenderStore = create<KalenderStore>((set) => ({
  dialogDate: null,
  isDialogOpen: false,

  setIsDialogOpen: (open) => set({ isDialogOpen: open }),
  openDailyDialog: (date) =>
    set({
      dialogDate: date,
      isDialogOpen: true,
    }),
}));
