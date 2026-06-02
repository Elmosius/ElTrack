import type { KantongSummaryItem } from '#/types/kantong';
import { KantongListItem } from './kantong-list-item';

export function KantongList({
  items,
  title,
}: {
  items: KantongSummaryItem[];
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className='space-y-3'>
      <h2 className='font-semibold tracking-tight'>{title}</h2>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        {items.map((item) => (
          <KantongListItem key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
