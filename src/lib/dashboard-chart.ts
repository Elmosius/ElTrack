import type {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexOptions,
} from 'apexcharts';
import {
  dashboardCategoryChartColors,
  dashboardEmptyChartText,
  dashboardPaymentChartColors,
  dashboardTrendSeries,
} from '@/const/dashboard';
import { formatCurrency } from './dashboard';

export type DashboardChartSeries =
  | ApexAxisChartSeries
  | ApexNonAxisChartSeries;

const baseChartOptions: ApexOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    animations: {
      speed: 400,
    },
    fontFamily: 'inherit',
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.15)',
    strokeDashArray: 4,
  },
  noData: {
    text: dashboardEmptyChartText,
    align: 'center',
    verticalAlign: 'middle',
    style: {
      color: '#94a3b8',
      fontSize: '12px',
    },
  },
};

export function createTrendChartOptions(labels: string[]): ApexOptions {
  return {
    ...baseChartOptions,
    colors: dashboardTrendSeries.map((item) => item.color),
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: labels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => formatCurrency(Number(value)).replace('Rp ', ''),
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(Number(value)),
      },
    },
  };
}

export function createDonutChartOptions(labels: string[]): ApexOptions {
  return {
    ...baseChartOptions,
    colors: dashboardCategoryChartColors,
    labels,
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(Number(value)),
      },
    },
  };
}

export function createPaymentBarChartOptions(labels: string[]): ApexOptions {
  return {
    ...baseChartOptions,
    colors: dashboardPaymentChartColors,
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '40%',
      },
    },
    xaxis: {
      categories: labels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => formatCurrency(Number(value)).replace('Rp ', ''),
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(Number(value)),
      },
    },
  };
}
