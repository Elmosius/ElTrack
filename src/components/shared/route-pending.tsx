export default function RoutePending() {
  return (
    <div className='flex flex-col gap-4 animate-pulse'>
      <div className='h-5 w-28 rounded-md bg-accent/55' />

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='h-28 rounded-xl border border-secondary-border bg-card'
          />
        ))}
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.1fr_0.9fr]'>
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
