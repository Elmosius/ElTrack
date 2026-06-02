export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan. Coba lagi.';
}

export * from './transaction-table.store-category.helpers';
export * from './transaction-table.store-row.helpers';
export * from './transaction-table.store-state.helpers';
