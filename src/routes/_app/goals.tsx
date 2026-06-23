import { GoalsPage } from '#/components/goals/goals-page';
import AppBreadCrumb from '#/components/shared/app-breadcrumb';
import { getGoalsData } from '#/features/goals/goals.functions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/goals')({
  loader: async () => getGoalsData(),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const list = [{ label: 'Goals', to: '/goals', active: true }];

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />
      <GoalsPage data={data} />
    </div>
  );
}
