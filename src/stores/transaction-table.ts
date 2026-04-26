import { create } from 'zustand';
import {
  createInitialTransactionTableState,
} from './transaction-table.store.helpers';
import { createTransactionTableBaseActions } from './transaction-table.store-base-actions';
import { createTransactionTableRowActions } from './transaction-table.store-row-actions';
import { createTransactionTableCategoryActions } from './transaction-table.store-category-actions';
import type { TransactionTableStore } from './transaction-table.store.types';

export const useTransactionTableStore = create<TransactionTableStore>(
  (set, get) => ({
    ...createInitialTransactionTableState(),
    ...createTransactionTableBaseActions(set, get),
    ...createTransactionTableRowActions(set, get),
    ...createTransactionTableCategoryActions(set, get),
  }),
);
