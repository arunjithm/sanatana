'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DomainId, GraphNode, KnowledgeNode } from '@/types/knowledge';
import { SearchBar } from '@/components/ui/SearchBar';
import { NodePanel } from '@/components/panel/NodePanel';
import { DomainFilter } from '@/components/ui/DomainFilter';
import { ExplorationHistory } from '@/components/ui/ExplorationHistory';
import { ViewSwitcher, ViewMode } from '@/components/ui/ViewSwitcher';
import { useSearch } from '@/hooks/useSearch';
import { useNodeSelection } from '@/hooks/useNodeSelection';

// Dynamically import visualization components with ssr: false
const GraphCanvas = dynamic(() => import('@/components/graph/GraphCanvas'), {
  ssr: false,
  loading: () => <LoadingScreen message="Loading 3D Cosmic Space…" />,
});

const VedaVriksha = dynamic(
  () => import('@/components/tree/VedaVriksha').then((m) => m.VedaVriksha),
  {
    ssr: false,
    loading: () => <LoadingScreen message="Constructing Veda Vriksha Taxonomy…" />,
  }
);

const DarshanaMatrix = dynamic(
  () => import('@/components/darshana/DarshanaMatrix').then((m) => m.DarshanaMatrix),
  {
    ssr: false,
    loading: () => <LoadingScreen message="Synthesizing Shad-Darshana Matrix…" />,
  }
);

const TimelineView = dynamic(
  () => import('@/components/timeline/TimelineView').then((m) => m.TimelineView),
  {
    ssr: false,
    loading: () => <LoadingScreen message="Aligning Yuga Chronology…" />,
  }
);

const RadialOrbitView = dynamic(
  () => import('@/components/orbit/RadialOrbitView').then((m) => m.RadialOrbitView),
  {
    ssr: false,
    loading: () => <LoadingScreen message="Calibrating Mandala Orbit…" />,
  }
);

const AnalyticsView = dynamic(
  () => import('@/components/analytics/AnalyticsView').then((m) => m.AnalyticsView),
  {
    ssr: false,
    loading: () => <LoadingScreen message="Computing Graph Centrality…" />,
  }
);

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050510] text-yellow-400 gap-3">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-gray-400 font-mono">{message}</span>
    </div>
  );
}

const ALL_DOMAINS: DomainId[] = [
  'shruti', 'smriti', 'purana', 'vedanga',
  'upaveda', 'darshana', 'agama',
  'deity', 'sage', 'concept', 'science_art',
];

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('cosmic');
  const [activeDomains, setActiveDomains] = useState<Set<DomainId>>(new Set(ALL_DOMAINS));
  const { query, setQuery, results, highlightedIds } = useSearch();
  const { selectedNode, selectNode, history } = useNodeSelection();

  // Keyboard shortcut listener (1-6 for views, Escape to deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in search input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '1') setViewMode('cosmic');
      else if (e.key === '2') setViewMode('tree');
      else if (e.key === '3') setViewMode('darshana');
      else if (e.key === '4') setViewMode('timeline');
      else if (e.key === '5') setViewMode('orbit');
      else if (e.key === '6') setViewMode('analytics');
      else if (e.key === 'Escape') selectNode(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectNode]);

  const handleToggleDomain = (id: DomainId) => {
    setActiveDomains((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleResetDomains = () => {
    setActiveDomains(new Set(ALL_DOMAINS));
  };

  return (
    <main className="w-screen h-screen overflow-hidden relative bg-[#050510]">
      {/* Top Floating View Navigation HUD */}
      <ViewSwitcher
        currentView={viewMode}
        onSelectView={setViewMode}
        selectedNodeName={selectedNode?.nameEnglish}
        onClearSelectedNode={() => selectNode(null)}
      />

      {/* Global Search Bar */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        results={results}
        onNodeSelect={(node) => selectNode(node)}
      />

      {/* Primary Visualization Engine Container */}
      <div className="w-full h-full pt-14">
        {viewMode === 'cosmic' && (
          <GraphCanvas
            activeDomains={activeDomains}
            onNodeClick={(n: GraphNode) => selectNode(n)}
            selectedNode={selectedNode as GraphNode}
            highlightedNodeIds={highlightedIds}
          />
        )}

        {viewMode === 'tree' && (
          <VedaVriksha
            onSelectNode={(node: KnowledgeNode) => selectNode(node)}
            selectedNode={selectedNode}
            activeDomains={activeDomains}
            highlightedNodeIds={highlightedIds}
          />
        )}

        {viewMode === 'darshana' && (
          <DarshanaMatrix
            onSelectNode={(node: KnowledgeNode) => selectNode(node)}
            selectedNode={selectedNode}
          />
        )}

        {viewMode === 'timeline' && (
          <TimelineView
            onSelectNode={(node: KnowledgeNode) => selectNode(node)}
            selectedNode={selectedNode}
            activeDomains={activeDomains}
          />
        )}

        {viewMode === 'orbit' && (
          <RadialOrbitView
            centerNode={selectedNode}
            onSelectNode={(node: KnowledgeNode) => selectNode(node)}
          />
        )}

        {viewMode === 'analytics' && (
          <AnalyticsView
            onSelectNode={(node: KnowledgeNode) => selectNode(node)}
          />
        )}
      </div>

      {/* Detailed Node Inspector Sidebar */}
      <NodePanel
        node={selectedNode}
        onClose={() => selectNode(null)}
        onNavigateTo={(node) => selectNode(node)}
        onSwitchView={(v) => setViewMode(v)}
      />

      {/* Exploration History Trail */}
      <ExplorationHistory history={history} onSelect={selectNode} />

      {/* Bottom Domain Filter (displayed in graph, tree, and timeline modes) */}
      {(viewMode === 'cosmic' || viewMode === 'tree' || viewMode === 'timeline') && (
        <DomainFilter
          activeDomains={activeDomains}
          onToggle={handleToggleDomain}
          onReset={handleResetDomains}
        />
      )}
    </main>
  );
}
