import { Button } from '#/components/selia/button';
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '#/components/selia/card';
import { authClient } from '#/lib/auth-client';
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
      <Card className='ring-0 text-center shadow-none'>
        <CardHeader className='border-none'>
          <CardTitle className='font-semibold text-2xl lg:text-4xl tracking-wide py-1'>Welcome to ElTrack</CardTitle>
          <CardDescription className='text-sm lg:text-base'>Please login to your account to continue using ElTrack and manage your financial records effectively.</CardDescription>
        </CardHeader>
        <CardBody className='p-0'>
          <Button variant={'outline'} className={'text-sm lg:text-base'} onClick={handleGoogleLogin}>
            <img src='/web_neutral_rd_na.svg' alt='Google Logo' className='size-8' />
            Continue with Google
          </Button>
        </CardBody>
      </Card>
    </>
  );
}
