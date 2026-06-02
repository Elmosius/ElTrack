import type { SelectOption } from '#/types/transaction-table';
import { useMemo } from 'react';
import { createOptionMap } from './use-transaction-table.helpers';

type TransactionTableBodyOptions = {
  waktuOptions: readonly SelectOption[];
  kantongOptions: readonly SelectOption[];
  metodePembayaranOptions: readonly SelectOption[];
  tipeOptions: readonly SelectOption[];
};

export function useTransactionTableOptionMap(
  options: readonly SelectOption[],
) {
  return useMemo(() => createOptionMap(options), [options]);
}

export function useTransactionTableBodyOptionMaps({
  waktuOptions,
  kantongOptions,
  metodePembayaranOptions,
  tipeOptions,
}: TransactionTableBodyOptions) {
  const waktuMap = useTransactionTableOptionMap(waktuOptions);
  const kantongMap = useTransactionTableOptionMap(kantongOptions);
  const metodePembayaranMap = useTransactionTableOptionMap(
    metodePembayaranOptions,
  );
  const tipeMap = useTransactionTableOptionMap(tipeOptions);

  return {
    waktuMap,
    kantongMap,
    metodePembayaranMap,
    tipeMap,
  };
}
