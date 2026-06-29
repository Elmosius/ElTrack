import AuthLayout from '#/components/layouts/auth';
import { getSession } from '#/lib/auth/functions';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession();

    if (session) {
      throw redirect({ to: '/', search: { month: undefined } });
    }
  },
});

function RouteComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
