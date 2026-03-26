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
      <nav className='w-full flex items-center justify-between'>
        <div className='flex gap-4 items-center'>
          <Button variant={'plain'} size={'sm-icon'} className={'lg:hidden flex'} onClick={toggleSidebar}>
            <SidebarOpen className='size-4 text-muted' />
          </Button>

          <span className='text-2xl'>Hello {user?.name || 'User'}!</span>
        </div>
        <Menu>
          <MenuTrigger>
            <Avatar size={'sm'} className={'font-normal text-sm  text-white cursor-pointer bg-primary/80 hover:bg-primary'}>
              {user?.image ? <AvatarImage src={user?.image} alt={user.name} /> : <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>}
            </Avatar>
          </MenuTrigger>
        </Menu>
      </nav>
    </header>
  );
}
