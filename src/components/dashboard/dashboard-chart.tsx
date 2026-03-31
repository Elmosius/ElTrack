'use client';

import type {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexOptions,
} from 'apexcharts';
import { useEffect, useState, type ComponentType } from 'react';

type DashboardChartComponentProps = {
  type: 'line' | 'bar' | 'donut';
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  height?: number | string;
};

type DashboardChartProps = DashboardChartComponentProps & {
  fallbackClassName?: string;
};

export function DashboardChart({
  fallbackClassName = 'h-72',
  ...props
}: DashboardChartProps) {
  const [ChartComponent, setChartComponent] =
    useState<ComponentType<DashboardChartComponentProps> | null>(null);

  useEffect(() => {
    let isMounted = true;

    void import('react-apexcharts').then((module) => {
      if (!isMounted) {
        return;
      }

      setChartComponent(() => module.default as ComponentType<DashboardChartComponentProps>);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!ChartComponent) {
    return (
      <div
        className={`w-full rounded-xl bg-accent/40 animate-pulse ${fallbackClassName}`}
      />
    );
  }

  return <ChartComponent {...props} />;
}
