export function DashboardPending() {
  return (
    <div className='flex flex-col gap-4 animate-pulse'>
      <div className='flex items-center justify-between gap-4'>
        <div className='space-y-2'>
          <div className='h-6 w-40 rounded-md bg-accent/55' />
          <div className='h-4 w-24 rounded-md bg-accent/40' />
        </div>
        <div className='h-10 w-40 rounded-xl bg-accent/45' />
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='h-28 rounded-xl border border-secondary-border bg-card'
          />
        ))}
      </div>

      <div className='h-80 rounded-xl border border-secondary-border bg-card' />

      <div className='grid gap-4 xl:grid-cols-2'>
        <div className='h-80 rounded-xl border border-secondary-border bg-card' />
        <div className='h-80 rounded-xl border border-secondary-border bg-card' />
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.05fr_0.95fr]'>
        <div className='h-72 rounded-xl border border-secondary-border bg-card' />
        <div className='h-72 rounded-xl border border-secondary-border bg-card' />
      </div>
    </div>
  );
}
