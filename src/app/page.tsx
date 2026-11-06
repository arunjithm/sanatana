'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { DomainId, GraphNode } from '@/types/knowledge';
import { SearchBar } from '@/components/ui/SearchBar';
import { NodePanel } from '@/components/panel/NodePanel';
import { useSearch } from '@/hooks/useSearch';
import { useNodeSelection } from '@/hooks/useNodeSelection';

const GraphCanvas = dynamic(() => import('@/components/graph/GraphCanvas'), {
  ssr: false,
});

const ALL_DOMAINS: DomainId[] = [
  'shruti', 'smriti', 'purana', 'vedanga',
  'upaveda', 'darshana', 'agama',
  'deity', 'sage', 'concept', 'science_art',
];

export default function Home() {
  const [activeDomains] = useState<Set<DomainId>>(new Set(ALL_DOMAINS));
  const { query, setQuery, results, highlightedIds } = useSearch();
  const { selectedNode, selectNode } = useNodeSelection();

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      <SearchBar
        query={query}
        setQuery={setQuery}
        results={results}
        onNodeSelect={(node) => selectNode(node)}
      />
      <GraphCanvas
        activeDomains={activeDomains}
        onNodeClick={(n: GraphNode) => selectNode(n)}
        highlightedNodeIds={highlightedIds}
      />
      <NodePanel
        node={selectedNode}
        onClose={() => selectNode(null)}
        onNavigateTo={(node) => selectNode(node)}
      />
    </main>
  );
}
