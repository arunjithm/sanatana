import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { getAllNodes } from '@/data/repository';
import type { KnowledgeNode } from '@/types/knowledge';

export function useSearch(): {
  query: string;
  setQuery: (q: string) => void;
  results: KnowledgeNode[];
  highlightedIds: Set<string>;
} {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<KnowledgeNode[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  const fuse = useMemo(
    () =>
      new Fuse(getAllNodes(), {
        keys: ['nameEnglish', 'nameTransliteration', 'explanation', 'meaningEnglish'],
        threshold: 0.4,
      }),
    []
  );

  function setQuery(q: string) {
    setQueryState(q);
    if (!q) {
      setResults([]);
      setHighlightedIds(new Set());
    } else {
      const hits = fuse.search(q, { limit: 10 }).map((r) => r.item);
      setResults(hits);
      setHighlightedIds(new Set(hits.map((n) => n.id)));
    }
  }

  return { query, setQuery, results, highlightedIds };
}
