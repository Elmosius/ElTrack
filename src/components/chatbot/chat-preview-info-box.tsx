type ChatPreviewInfoBoxProps = {
  title: string;
  items: string[];
  tone: 'warning' | 'neutral';
};

export function ChatPreviewInfoBox({
  title,
  items,
  tone,
}: ChatPreviewInfoBoxProps) {
  if (items.length === 0) {
    return null;
  }

  const toneClass =
    tone === 'warning'
      ? 'border-warning/25 bg-warning/8 text-warning'
      : 'border-card-separator bg-accent/70 text-muted';
  const titleClass = tone === 'warning' ? '' : 'text-foreground';

  return (
    <div className={`mt-3 rounded-lg border px-2.5 py-2 text-[11px] ${toneClass}`}>
      <p className={`font-medium ${titleClass}`}>{title}</p>
      <ul className='mt-1 list-disc pl-4'>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
