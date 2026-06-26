import { LanggananPage } from '#/components/langganan/langganan-page';
import AppBreadCrumb from '#/components/shared/app-breadcrumb';
import { getLanggananData } from '#/features/langganan/langganan.functions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/langganan')({
  loader: async () => getLanggananData(),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const list = [{ label: 'Langganan', to: '/langganan', active: true }];

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />
      <LanggananPage data={data} />
    </div>
  );
}
