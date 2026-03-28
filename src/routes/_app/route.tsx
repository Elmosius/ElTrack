import DefaultLayout from '#/components/layouts/default';
import { getSession } from '#/lib/auth.functions';
import { useSetUser } from '#/stores/user';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';

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
  const { user } = Route.useRouteContext();
  const setUser = useSetUser();

  useEffect(() => {
    setUser({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || undefined,
    });
  }, [setUser, user.email, user.id, user.image, user.name]);

  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
}
