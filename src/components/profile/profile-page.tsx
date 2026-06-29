import { Avatar, AvatarFallback, AvatarImage } from '#/components/selia/avatar';
import { Button } from '#/components/selia/button';
import { Card, CardBody } from '#/components/selia/card';
import { Tabs, TabsItem, TabsList } from '#/components/selia/tabs';
import { useTheme, type ThemeMode } from '#/hooks/use-theme';
import { authClient } from '#/lib/auth/client';
import { useClearUser, useUser } from '#/stores/user';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Monitor, Moon, Sun } from 'lucide-react';
import type React from 'react';

const themeOptions: Array<{
  value: ThemeMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'auto',
    label: 'Auto',
    description: 'Ikuti device',
    icon: <Monitor className='size-4' />,
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Tampilan terang',
    icon: <Sun className='size-4' />,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Tampilan gelap',
    icon: <Moon className='size-4' />,
  },
];

export function ProfilePage() {
  const user = useUser();
  const clearUser = useClearUser();
  const navigate = useNavigate();
  const { mode, resolvedTheme, setMode } = useTheme();
  const fallbackInitial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  const resolvedThemeLabel = resolvedTheme === 'dark' ? 'gelap' : 'terang';

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
    <div className='max-w-3xl'>
      <Card className='overflow-hidden'>
        <CardBody className='space-y-0 !p-0'>
          <section className='flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6'>
            <div className='flex min-w-0 items-center gap-4'>
              <Avatar size='lg' className='shrink-0 bg-primary/80 text-primary-foreground'>
                {user?.image ? <AvatarImage src={user.image} alt={user.name} /> : <AvatarFallback>{fallbackInitial}</AvatarFallback>}
              </Avatar>

              <div className='min-w-0'>
                <h2 className='truncate text-lg font-semibold'>Profile</h2>
                <p className='truncate text-sm font-medium'>{user?.name || 'User'}</p>
                <p className='truncate text-sm text-muted'>{user?.email || '-'}</p>
              </div>
            </div>

            <span className='w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-muted'>Google</span>
          </section>

          <section className='border-t border-card-separator'>
            <div className='flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-6'>
              <div className='min-w-0'>
                <h3 className='text-sm font-semibold'>Tema</h3>
                <p className='text-sm text-muted'>Ikuti device atau pilih manual.</p>
                <p className='mt-1 text-xs text-dimmed'>
                  Mode aktif: {mode === 'auto' ? `Auto (${resolvedThemeLabel})` : mode}.
                </p>
              </div>

              <Tabs value={mode} onValueChange={(value) => setMode(value as ThemeMode)} className='w-full md:w-80'>
                <TabsList className='grid w-full grid-cols-3'>
                  {themeOptions.map((option) => {
                    return (
                      <TabsItem
                        key={option.value}
                        value={option.value}
                        className='min-w-0 gap-1.5 px-2 text-xs'
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </TabsItem>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </section>

          <section className='border-t border-card-separator'>
            <div className='flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-6'>
              <div>
                <h3 className='text-sm font-semibold'>Sesi</h3>
                <p className='text-sm text-muted'>Keluar dari akun ElTrack di perangkat ini.</p>
              </div>

              <Button variant='outline' size='sm' className='text-sm w-full md:w-auto' onClick={handleLogout}>
                <LogOut className='size-3' />
                Logout
              </Button>
            </div>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
