import { authClient } from '#/lib/auth/client';
import { useClearUser, useUser } from '#/stores/user';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, SidebarOpen, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../selia/avatar';
import { Button } from '../selia/button';
import { Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from '../selia/menu';

type AppHeaderProps = {
  toggleSidebar: () => void;
};

export default function AppHeader({ toggleSidebar }: AppHeaderProps) {
  const user = useUser();
  const clearUser = useClearUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          clearUser();
          navigate({ to: '/auth/login' });
        },
      },
    });
  };

  return (
    <header className='w-full'>
      <nav className='flex w-full min-w-0 items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2 md:gap-4'>
          <Button variant={'plain'} size={'sm-icon'} className={'flex shrink-0 lg:hidden'} onClick={toggleSidebar}>
            <SidebarOpen className='size-4 text-muted' />
          </Button>

          <span className='truncate text-sm md:text-base'>Hello {user?.name || 'User'}!</span>
        </div>
        <Menu>
          <MenuTrigger aria-label='Buka menu profile'>
            <Avatar size={'sm'} className={'shrink-0 cursor-pointer bg-primary/80 text-sm font-normal text-primary-foreground hover:bg-primary'}>
              {user?.image ? <AvatarImage src={user?.image} alt={user.name} /> : <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>}
            </Avatar>
          </MenuTrigger>
          <MenuPopup align='end' size='compact'>
            <MenuItem
            className={'text-sm'}
              onClick={() => {
                void navigate({ to: '/profile' });
              }}
            >
              <UserRound className='size-4' />
              Profile
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={handleLogout} className={'text-sm'}>
              <LogOut className='size-4' />
              Logout
            </MenuItem>
          </MenuPopup>
        </Menu>
      </nav>
    </header>
  );
}
