import { Button } from '#/components/selia/button';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '#/components/selia/card';
import { authClient } from '#/lib/auth/client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const handleGoogleLogin = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  return (
    <>
      <Card className='w-full max-w-md ring-0 text-center shadow-none bg-background'>
        <CardHeader className='flex! grid-cols-none! flex-col items-center justify-center gap-2 border-none p-0!'>
          <CardTitle className='font-semibold text-2xl md:text-3xl tracking-wide py-1'>Welcome to ElTrack</CardTitle>
          <CardDescription className='text-sm lg:text-base max-w-sm'>Please login to your account to continue using ElTrack and manage your financial records effectively.</CardDescription>
        </CardHeader>
        <CardBody className='mt-6 p-0!'>
          <Button variant={'outline'} className={'text-sm lg:text-base'} onClick={handleGoogleLogin}>
            <img src='/web_neutral_rd_na.svg' alt='Google Logo' className='size-8' />
            Continue with Google
          </Button>
        </CardBody>
      </Card>
    </>
  );
}
