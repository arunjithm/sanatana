'use client';

import { useRef } from 'react';
import type { KnowledgeNode } from '@/types/knowledge';

interface SearchBarProps {
  onNodeSelect: (node: KnowledgeNode) => void;
  query: string;
  setQuery: (q: string) => void;
  results: KnowledgeNode[];
}

export function SearchBar({ onNodeSelect, query, setQuery, results }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelect(node: KnowledgeNode) {
    onNodeSelect(node);
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setQuery('');
    }
  }

  const showDropdown = query.length > 0;

  return (
    <div
      style={{ position: 'fixed', top: 16, left: 16, zIndex: 50, width: 320 }}
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search deities, scriptures, concepts…"
        className="w-full px-4 py-2 rounded-lg bg-gray-900/90 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm"
        style={{ fontFamily: 'inherit' }}
      />
      {showDropdown && (
        <div className="mt-1 rounded-lg bg-gray-900/90 border border-gray-700 overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-2 text-gray-400 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((node) => (
              <button
                key={node.id}
                onClick={() => handleSelect(node)}
                className="w-full text-left px-4 py-2 hover:bg-gray-700/80 text-white text-sm flex flex-col gap-0.5 border-b border-gray-700/50 last:border-b-0"
              >
                <span className="font-medium">{node.nameEnglish}</span>
                <span className="text-gray-400 text-xs font-devanagari">
                  {node.nameDevanagari}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
