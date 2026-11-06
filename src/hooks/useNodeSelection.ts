import { useState, useCallback } from 'react';
import type { KnowledgeNode } from '@/types/knowledge';

const MAX_HISTORY = 10;

export function useNodeSelection() {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [history, setHistory] = useState<KnowledgeNode[]>([]);

  const selectNode = useCallback((node: KnowledgeNode | null) => {
    if (node !== null) {
      setHistory((prev) => {
        const withoutDup = prev[prev.length - 1]?.id === node.id ? prev : [...prev, node];
        return withoutDup.slice(-MAX_HISTORY);
      });
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);

  return { selectedNode, selectNode, history };
}
