import { ProfilePage } from '#/components/profile/profile-page';
import AppBreadCrumb from '#/components/shared/app-breadcrumb';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const list = [{ label: 'Profile', to: '/profile', active: true }];

  return (
    <div className='flex flex-col gap-4'>
      <AppBreadCrumb list={{ items: list }} />
      <ProfilePage />
    </div>
  );
}
