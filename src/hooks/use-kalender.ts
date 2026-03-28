import { getDailyTotal, getDailyTransactions, getDaysWithTransactions, parseIsoDate, toIsoDate } from '#/lib/kalender';
import { useKalenderStore } from '#/stores/kalender';
import { useTransactionTableStore } from '#/stores/transaction-table';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

function createOptionMap(options: Array<{ id: string; name: string }>) {
  return new Map(options.map((option) => [option.id, option.name]));
}

export function useKalenderContent() {
  const rows = useTransactionTableStore((state) => state.rows);
  const selectedDate = useTransactionTableStore((state) => state.selectedDate);
  const setSelectedDate = useTransactionTableStore((state) => state.setSelectedDate);
  const openDailyDialog = useKalenderStore((state) => state.openDailyDialog);

  const selectedDay = useMemo(() => parseIsoDate(selectedDate), [selectedDate]);
  const daysWithTransactions = useMemo(() => getDaysWithTransactions(rows), [rows]);

  const handleDayClick = (day: Date) => {
    const isoDate = toIsoDate(day);

    setSelectedDate(isoDate);
    openDailyDialog(isoDate);
  };

  return {
    selectedDay,
    daysWithTransactions,
    handleDayClick,
  };
}

export function useKalenderDailyDialog() {
  const rows = useTransactionTableStore((state) => state.rows);
  const categories = useTransactionTableStore((state) => state.categories);
  const waktuOptions = useTransactionTableStore((state) => state.waktuOptions);
  const metodePembayaranOptions = useTransactionTableStore((state) => state.metodePembayaranOptions);
  const tipeOptions = useTransactionTableStore((state) => state.tipeOptions);
  const { dialogDate, isDialogOpen, setIsDialogOpen } = useKalenderStore(
    useShallow((state) => ({
      dialogDate: state.dialogDate,
      isDialogOpen: state.isDialogOpen,
      setIsDialogOpen: state.setIsDialogOpen,
    })),
  );

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const waktuMap = useMemo(() => createOptionMap(waktuOptions), [waktuOptions]);
  const metodePembayaranMap = useMemo(() => createOptionMap(metodePembayaranOptions), [metodePembayaranOptions]);
  const tipeMap = useMemo(() => createOptionMap(tipeOptions), [tipeOptions]);
  const dailyTransactions = useMemo(() => getDailyTransactions(rows, dialogDate), [rows, dialogDate]);
  const dailyTotal = useMemo(() => getDailyTotal(dailyTransactions), [dailyTransactions]);

  return {
    dialogDate,
    isDialogOpen,
    setIsDialogOpen,
    categoryMap,
    waktuMap,
    metodePembayaranMap,
    tipeMap,
    dailyTransactions,
    dailyTotal,
  };
}
