export function CatatanKeuanganPending() {
  return (
    <div className='flex flex-col gap-4 animate-pulse'>
      <div className='h-5 w-36 rounded-md bg-accent/55' />

      <div className='w-48 h-10 rounded-xl bg-accent/45' />

      <div className='rounded-xl border border-secondary-border bg-card overflow-hidden'>
        <div className='border-b border-card-separator px-4 py-3'>
          <div className='h-5 w-44 rounded-md bg-accent/45' />
        </div>

        <div className='p-4 space-y-3'>
          <div className='grid grid-cols-8 gap-3'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='h-4 rounded bg-accent/40' />
            ))}
          </div>

          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className='grid grid-cols-8 gap-3'>
              {Array.from({ length: 8 }).map((_, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className='h-10 rounded-lg bg-accent/35'
                />
              ))}
            </div>
          ))}
        </div>

        <div className='border-t border-card-separator px-4 py-3'>
          <div className='mx-auto h-9 w-36 rounded-lg bg-accent/45' />
        </div>
      </div>
    </div>
  );
}
