import { useIsMobile } from '#/hooks/use-mobile';
import { useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import Chatbot from '../chatbot';
import { Toast } from '../selia/toast';
import AppHeader from '../shared/app-header';
import AppSidebar from '../shared/app-sidebar';

type DefaultLayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
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

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    setIsMobileSidebarOpen(false);
  }, [isMobile, location.pathname]);

  return (
    <div className='flex h-dvh w-full overflow-hidden'>
      <Toast />

      {isMobile && isMobileSidebarOpen ? (
        <button
          type='button'
          aria-label='Tutup menu'
          className='fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px] lg:hidden'
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      ) : null}

      <AppSidebar
        isSidebarOpen={isSidebarOpen}
        onNavigate={() => {
          if (isMobile) {
            setIsMobileSidebarOpen(false);
          }
        }}
      />

      <main className='flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 py-4 transition-all duration-300 md:px-8 md:py-8'>
        {/* header */}
        <AppHeader toggleSidebar={toggleSidebar} />

        {/* main content */}
        <section className='min-w-0 py-4 md:py-8'>{children}</section>
      </main>

      <Chatbot />
    </div>
  );
}
