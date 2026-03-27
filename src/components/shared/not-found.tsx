import { Link } from '@tanstack/react-router';
import { Button } from '../selia/button';
import { Carrot } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='container mx-auto p-4 text-center min-h-screen min-w-screen bg-primary'>
      <div className='flex flex-col justify-center items-center w-full h-screen gap-2 md:gap-4 lg:gap-6'>
        <Carrot className='size-6 md:size-8 text-background lg:my-4 '/>
        <h1 className='text-2xl md:text-4xl lg:text-6xl text-background'>Page Not Found.</h1>
        <p className='text-sm md:text-base lg:text-xl font-light text-background lg:w-1/5'>This page does not exist, please head back home and try again</p>
        <Link to='/'>
          <Button variant={'secondary'} className={'text-sm md:text-base my-2'} size={'sm'}>
            Back to homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
