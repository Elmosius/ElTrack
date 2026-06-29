import { useUser } from '#/stores/user';
import { SidebarOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../selia/avatar';
import { Button } from '../selia/button';
import { Menu, MenuTrigger } from '../selia/menu';

type AppHeaderProps = {
  toggleSidebar: () => void;
};

export default function AppHeader({ toggleSidebar }: AppHeaderProps) {
  const user = useUser();

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
          <MenuTrigger>
            <Avatar size={'sm'} className={'shrink-0 font-normal text-sm text-white cursor-pointer bg-primary/80 hover:bg-primary'}>
              {user?.image ? <AvatarImage src={user?.image} alt={user.name} /> : <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>}
            </Avatar>
          </MenuTrigger>
        </Menu>
      </nav>
    </header>
  );
}
