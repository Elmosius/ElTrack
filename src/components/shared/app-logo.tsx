import { cn } from '#/lib/utils';
import type { ComponentProps } from 'react';

type AppLogoProps = Omit<ComponentProps<'img'>, 'alt' | 'src'>;

export function AppLogo({ className, ...props }: AppLogoProps) {
  return (
    <img
      aria-hidden='true'
      src='/eltrack-logo.png'
      alt=''
      className={cn('size-5 shrink-0 object-contain', className)}
      {...props}
    />
  );
}
