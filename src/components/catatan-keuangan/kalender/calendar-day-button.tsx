import { cn } from '#/lib/utils';
import type { DayButtonProps } from 'react-day-picker';

export function CalendarDayButton({ className, modifiers, children, ...props }: DayButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'relative mx-auto flex h-full w-full min-h-9 min-w-9 items-center justify-center rounded-md text-sm transition-colors',
        'hover:bg-accent hover:text-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        modifiers.selected && 'bg-accent text-foreground',
        modifiers.today && 'bg-primary text-primary-foreground',
        modifiers.outside && 'text-dimmed/60',
        className,
      )}
    >
      <span>{children}</span>
      {modifiers.hasTransactions && <span className={cn('absolute bottom-1 size-1 rounded-full', modifiers.today ? 'bg-primary-foreground/90' : 'bg-dimmed')} />}
    </button>
  );
}
