import { Link } from '@tanstack/react-router';
import { Button } from '../selia/button';
import { CircleX } from 'lucide-react';

export default function AppError() {
  return (
    <div className='container mx-auto p-4 text-center h-screen min-w-screen bg-background'>
      <div className='h-full flex flex-col items-center justify-center '>
        <CircleX className='size-8 md:size-12 text-primary'/>
        <h1 className='font-medium text-sm md:text-lg pt-2 md:pt-4'>Something went wrong, </h1>
        <p className='text-sm text-muted md:text-base'>Could not load page</p>
        <Link to='/' search={{ month: undefined }}>
          <Button className={'ring-0 text-sm my-2 md:my-4'} size={'sm'}>Back Home</Button>
        </Link>
      </div>
    </div>
  );
}
