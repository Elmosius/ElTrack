import { SidebarOpen } from 'lucide-react';
import { Avatar } from '../selia/avatar';
import { Button } from '../selia/button';
import { Menu, MenuTrigger } from '../selia/menu';

type AppHeaderProps = {
  toggleSidebar: () => void;
};

export default function AppHeader({ toggleSidebar }: AppHeaderProps) {
  return (
    <header className='w-full'>
      <nav className='w-full flex items-center justify-between'>
        <div className='flex gap-4 items-center'>
          <Button variant={'plain'} size={'sm-icon'} className={'lg:hidden flex'} onClick={toggleSidebar}>
            <SidebarOpen className='size-4 text-muted' />
          </Button>

          <span className='text-2xl'>Hello Elmo</span>
        </div>
        <Menu>
          <MenuTrigger>
            <Avatar size={'sm'} className={'font-normal text-sm  text-white cursor-pointer bg-primary/80 hover:bg-primary'}>
              E
            </Avatar>
          </MenuTrigger>
        </Menu>
      </nav>
    </header>
  );
}
