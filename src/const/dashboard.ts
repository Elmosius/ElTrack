export const dashboardTrendSeries = [
  {
    key: 'expenses',
    label: 'Pengeluaran',
    color: '#dc2626',
  },
  {
    key: 'income',
    label: 'Penghasilan',
    color: '#16a34a',
  },
] as const;

export const dashboardCategoryChartColors = [
  '#f97316',
  '#fb923c',
  '#fdba74',
  '#f59e0b',
  '#facc15',
];

export const dashboardPaymentChartColors = ['#0f766e'];

export const dashboardTrendModes = [
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
] as const;

export const dashboardEmptyChartText = 'Belum ada data untuk periode ini.';
