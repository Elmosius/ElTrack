import { HomeDashboard } from '#/components/dashboard/home-dashboard';
import AppBreadCrumb from '#/components/shared/app-breadcrumb';
import { getDashboardHome } from '#/features/dashboard/dashboard.functions';
import { normalizeDashboardMonth } from '#/lib/dashboard';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/')({
  validateSearch: (search: Record<string, unknown>) => ({
    month:
      typeof search.month === 'string' && /^\d{4}-\d{2}$/.test(search.month)
        ? search.month
        : undefined,
  }),
  loaderDeps: ({ search }) => ({
    month: normalizeDashboardMonth(search.month),
  }),
  loader: async ({ deps }) => {
    return getDashboardHome({
      data: {
        month: deps.month,
      },
    });
  },
  component: App,
});

function App() {
  const list = [{ label: 'Home', to: '/', active: true }];
  const navigate = useNavigate({ from: Route.fullPath });
  const data = Route.useLoaderData();

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />

      <HomeDashboard
        data={data}
        onMonthChange={(month) => {
          void navigate({
            search: (previousSearch) => ({
              ...previousSearch,
              month: normalizeDashboardMonth(month),
            }),
          });
        }}
      />
    </div>
  );
}
