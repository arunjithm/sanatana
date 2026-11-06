'use client';

import type { KnowledgeNode } from '@/types/knowledge';

interface ExplorationHistoryProps {
  history: KnowledgeNode[];
  onSelect: (node: KnowledgeNode) => void;
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

export function ExplorationHistory({ history, onSelect }: ExplorationHistoryProps) {
  if (history.length === 0) return null;

  const recent = history.slice(-5);

  return (
    <div className="fixed bottom-16 left-4 flex gap-2 flex-wrap z-50">
      {recent.map((node, i) => (
        <button
          key={`${node.id}-${i}`}
          onClick={() => onSelect(node)}
          className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all border border-gray-700"
          title={node.nameEnglish}
        >
          {truncate(node.nameEnglish, 15)}
        </button>
      ))}
    </div>
  );
}
