import type { SanskritPassage as SanskritPassageType } from '@/types/knowledge';
import { SourceBadge } from './SourceBadge';

interface SanskritPassageProps {
  passage: SanskritPassageType;
}

export function SanskritPassage({ passage }: SanskritPassageProps) {
  if (!passage) return null;
  return (
    <div className="mb-4 space-y-1">
      <div className="text-xl text-yellow-400 font-devanagari">{passage.sanskrit}</div>
      <div className="text-sm italic text-gray-400">{passage.transliteration}</div>
      <div className="text-sm text-gray-200">{passage.translation}</div>
      <div className="mt-1">
        <SourceBadge source={passage.source} />
      </div>
    </div>
  );
}
