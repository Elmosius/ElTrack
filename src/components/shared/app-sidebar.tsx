import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupTitle, SidebarHeader, SidebarItem, SidebarItemButton, SidebarList, SidebarMenu } from '#/components/selia/sidebar';
import { MENU_SIDEBAR } from '#/const/sidebar';
import { authClient } from '#/lib/auth-client';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Coins, LogOut, PlusIcon } from 'lucide-react';

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
    <Sidebar className={`overflow-hidden border-r border-b border-gray-200 rounded-lg py-4 z-10 transition-[width,opacity] duration-300 ease-out ${isSidebarOpen ? 'w-50 opacity-100 lg:w-70' : 'w-0 opacity-0'}`} size={'loose'}>
      <SidebarHeader className='mx-2'>
        <h1 className='text-2xl tracking-tight flex gap-2'>
          <Coins className='text-primary size-4' />
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
