import type { StateCreator } from 'zustand';
import type { TransactionTableStore } from './transaction-table.store.types';

export type TransactionTableSet = Parameters<
  StateCreator<TransactionTableStore>
>[0];

export type TransactionTableGet = Parameters<
  StateCreator<TransactionTableStore>
>[1];
