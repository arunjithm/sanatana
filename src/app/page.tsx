'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { DomainId, GraphNode } from '@/types/knowledge';
import { SearchBar } from '@/components/ui/SearchBar';
import { NodePanel } from '@/components/panel/NodePanel';
import { DomainFilter } from '@/components/ui/DomainFilter';
import { ExplorationHistory } from '@/components/ui/ExplorationHistory';
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
  const [activeDomains, setActiveDomains] = useState<Set<DomainId>>(new Set(ALL_DOMAINS));
  const { query, setQuery, results, highlightedIds } = useSearch();
  const { selectedNode, selectNode, history } = useNodeSelection();

  const handleToggleDomain = (id: DomainId) => {
    setActiveDomains(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleResetDomains = () => {
    setActiveDomains(new Set(ALL_DOMAINS));
  };

  return (
    <main style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
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
      <ExplorationHistory history={history} onSelect={selectNode} />
      <DomainFilter
        activeDomains={activeDomains}
        onToggle={handleToggleDomain}
        onReset={handleResetDomains}
      />
    </main>
  );
}
