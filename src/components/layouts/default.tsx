import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupTitle, SidebarHeader, SidebarItem, SidebarItemButton, SidebarList, SidebarMenu } from '#/components/selia/sidebar';
import { useIsMobile } from '#/hooks/use-mobile';
import { Banknote, Coins, Home, LogOut, PlusIcon, SidebarOpen } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../selia/avatar';
import { Button } from '../selia/button';
import { Menu, MenuTrigger } from '../selia/menu';

type DefaultLayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const isMobile = useIsMobile();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isSidebarOpen = isMobile ? isMobileSidebarOpen : isDesktopSidebarOpen;

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((prev) => !prev);
      return;
    }

    setIsDesktopSidebarOpen((prev) => !prev);
  };

  return (
    <div className='h-screen overflow-hidden flex w-full'>
      {/* sidebar desktop*/}

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
                <SidebarItem>
                  <SidebarItemButton active>
                    <Home className='size-4' />
                    <span className='text-sm text-muted'>Home</span>
                  </SidebarItemButton>
                </SidebarItem>
                <SidebarItem>
                  <SidebarItemButton>
                    <Banknote className='size-4' />
                    <span className='text-sm text-muted'>Catatan Keuangan</span>
                  </SidebarItemButton>
                </SidebarItem>
              </SidebarList>
            </SidebarGroup>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton>
                  <LogOut />
                  <span className='text-sm text-muted'>Logout</span>
                </SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <main className='flex flex-1 flex-col min-h-screen w-full px-8 py-8 transition-all duration-300'>
        {/* header */}
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

        {/* main content */}
        <section className='py-8'>{children}</section>
      </main>
    </div>
  );
}
