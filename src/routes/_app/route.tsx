import DefaultLayout from '#/components/layouts/default';
import { getSession } from '#/lib/auth.functions';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: '/auth/login' });
    }

    return { user: session.user };
  },
});

function RouteComponent() {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
}
