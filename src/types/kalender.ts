export type KalenderStore = {
  dialogDate: string | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  openDailyDialog: (date: string) => void;
};
