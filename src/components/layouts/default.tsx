import { useIsMobile } from '#/hooks/use-mobile';
import { useState } from 'react';
import Chatbot from '../chatbot';
import AppHeader from '../shared/app-header';
import AppSidebar from '../shared/app-sidebar';

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
      <AppSidebar isSidebarOpen={isSidebarOpen} />

      <main className='flex flex-1 flex-col min-h-screen min-w-0 w-full px-8 py-8 transition-all duration-300'>
        {/* header */}
        <AppHeader toggleSidebar={toggleSidebar} />

        {/* main content */}
        <section className='py-8 min-w-0'>{children}</section>
      </main>

      <Chatbot />
    </div>
  );
}
