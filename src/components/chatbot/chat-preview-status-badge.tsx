type ChatPreviewStatusBadgeProps = {
  isReady: boolean;
  readyLabel: string;
  pendingLabel: string;
};

export function ChatPreviewStatusBadge({
  isReady,
  readyLabel,
  pendingLabel,
}: ChatPreviewStatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-medium ${
        isReady ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
      }`}
    >
      {isReady ? readyLabel : pendingLabel}
    </span>
  );
}
