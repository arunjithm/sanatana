'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { DomainId, GraphNode } from '@/types/knowledge';

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
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightedNodeIds] = useState<Set<string>>(new Set());

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      <GraphCanvas
        activeDomains={activeDomains}
        onNodeClick={(n) => setSelectedNode(n)}
        highlightedNodeIds={highlightedNodeIds}
      />
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(5,5,16,0.85)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 8,
            maxWidth: 260,
            fontSize: 13,
          }}
        >
          <strong>{selectedNode.nameEnglish}</strong>
          <div style={{ opacity: 0.7, marginTop: 4 }}>
            {selectedNode.nameDevanagari}
          </div>
          <div style={{ marginTop: 6 }}>{selectedNode.meaningEnglish}</div>
        </div>
      )}
    </main>
  );
}
