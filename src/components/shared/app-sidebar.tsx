import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupTitle, SidebarHeader, SidebarItem, SidebarItemButton, SidebarList, SidebarMenu } from '#/components/selia/sidebar';
import { AppLogo } from '#/components/shared/app-logo';
import { MENU_SIDEBAR } from '#/const/sidebar';
import { authClient } from '#/lib/auth/client';
import { cn } from '#/lib/utils';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { LogOut, PlusIcon } from 'lucide-react';

type AppSidebarProps = {
  isSidebarOpen: boolean;
  onNavigate?: () => void;
};

export default function AppSidebar({
  isSidebarOpen,
  onNavigate,
}: AppSidebarProps) {
  const route = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/auth/login' });
        },
      },
    });
  };

  return (
    <Sidebar
      className={cn(
        'fixed inset-y-0 left-0 z-40 max-w-[calc(100vw-3rem)] overflow-hidden border-r border-b border-gray-200 bg-background py-4 shadow-2xl transition-[transform,width,opacity] duration-300 ease-out lg:static lg:z-10 lg:rounded-lg lg:shadow-none',
        isSidebarOpen
          ? 'pointer-events-auto w-68 translate-x-0 opacity-100 lg:w-70'
          : 'pointer-events-none w-68 -translate-x-full opacity-0 lg:w-0 lg:translate-x-0',
      )}
      size={'loose'}
    >
      <SidebarHeader className='mx-2'>
        <h1 className='flex items-center gap-2 text-base tracking-tight'>
          <AppLogo className='size-5 text-primary' />
          ElTrack
        </h1>
      </SidebarHeader>
      <SidebarContent className='my-4'>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupTitle className='text-xs font-medium uppercase tracking-wide'>Track</SidebarGroupTitle>
            <SidebarGroupAction>
              <PlusIcon className='text-muted' />
            </SidebarGroupAction>
            <SidebarList>
              {MENU_SIDEBAR.map(({ label, icon, to }) => {
                const isActive = route.pathname === to;

                return (
                  <Link
                    to={to}
                    key={label}
                    preload='render'
                    onClick={() => {
                      onNavigate?.();
                    }}
                  >
                    <SidebarItem>
                      <SidebarItemButton active={isActive}>
                        {icon}
                        <span className='text-sm text-muted'>{label}</span>
                      </SidebarItemButton>
                    </SidebarItem>
                  </Link>
                );
              })}
            </SidebarList>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarList>
            <SidebarItem>
              <SidebarItemButton onClick={handleLogout}>
                <LogOut />
                <span className='text-sm text-muted'>Logout</span>
              </SidebarItemButton>
            </SidebarItem>
          </SidebarList>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
