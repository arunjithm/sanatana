import type { SourceReference } from '@/types/knowledge';

interface SourceBadgeProps {
  source: SourceReference;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const label = source.section ? `${source.text} • ${source.section}` : source.text;
  return (
    <span className="inline-flex items-center gap-1 text-xs border border-yellow-500 text-yellow-400 rounded-full px-2 py-0.5">
      {label}
      {source.recension && (
        <span className="text-yellow-300 opacity-70">({source.recension})</span>
      )}
    </span>
  );
}
