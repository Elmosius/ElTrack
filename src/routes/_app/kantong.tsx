import { KantongPage } from '#/components/kantong/kantong-page';
import AppBreadCrumb from '#/components/shared/app-breadcrumb';
import { getKantongData } from '#/features/kantong/kantong.functions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/kantong')({
  loader: async () => getKantongData(),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const list = [{ label: 'Kantong', to: '/kantong', active: true }];

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />
      <KantongPage data={data} />
    </div>
  );
}
