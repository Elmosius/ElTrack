import DefaultLayout from '#/components/layouts/default';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
}
