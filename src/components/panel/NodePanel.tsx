'use client';

import { useState, useEffect, useMemo } from 'react';
import type { KnowledgeNode, KnowledgeEdge } from '@/types/knowledge';
import { getEdgesForNode, getNodeById } from '@/data/repository';
import { DOMAIN_COLORS, RELATIONSHIP_COLORS } from '@/components/graph/useGraphData';
import { SourceBadge } from './SourceBadge';
import { SanskritPassage } from './SanskritPassage';

interface NodePanelProps {
  node: KnowledgeNode | null;
  onClose: () => void;
  onNavigateTo: (node: KnowledgeNode) => void;
  onSwitchView?: (view: 'cosmic' | 'tree' | 'darshana' | 'timeline' | 'orbit' | 'analytics') => void;
}

const confidenceColor: Record<string, string> = {
  established: 'bg-green-700 text-green-100',
  traditional: 'bg-blue-700 text-blue-100',
  disputed: 'bg-orange-700 text-orange-100',
  uncertain: 'bg-gray-600 text-gray-200',
};

export function NodePanel({ node, onClose, onNavigateTo, onSwitchView }: NodePanelProps) {
  const [scholarsOpen, setScholarsOpen] = useState(false);

  useEffect(() => {
    setScholarsOpen(false);
  }, [node?.id]);

  const isOpen = node !== null;

  // Compute node edge connections summary
  const edges = useMemo(() => {
    if (!node) return [];
    return getEdgesForNode(node.id);
  }, [node]);

  const relBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    edges.forEach((e) => {
      counts[e.relationship] = (counts[e.relationship] || 0) + 1;
    });
    return Object.entries(counts);
  }, [edges]);

  const domainColor = node ? DOMAIN_COLORS[node.domain] || '#ffd700' : '#ffd700';

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 z-50 flex flex-col transition-transform duration-300 shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        background: '#0a0a1a',
        borderTop: `3px solid ${domainColor}`,
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {node && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-gray-800/80 bg-gray-950/40">
            <div className="flex-1 min-w-0">
              <div className="text-2xl text-yellow-400 font-devanagari leading-tight font-bold">
                {node.nameDevanagari}
              </div>
              <div className="text-sm italic text-gray-400 mt-0.5">{node.nameTransliteration}</div>
              <div className="text-base text-white mt-1 font-semibold">{node.nameEnglish}</div>
              {node.meaningEnglish && (
                <div className="text-xs text-gray-300 mt-0.5 leading-relaxed">{node.meaningEnglish}</div>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-xl leading-none flex-shrink-0 transition-colors"
              aria-label="Close panel"
            >
              ×
            </button>
          </div>

          {/* Quick Visualization Actions */}
          {onSwitchView && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-950/70 border-b border-gray-800/60">
              <button
                onClick={() => onSwitchView('cosmic')}
                className="flex-1 px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-medium border border-gray-800 transition-colors flex items-center justify-center gap-1.5"
                title="Fly camera to this node in 3D Cosmic Space"
              >
                <span>🌌 Focus in 3D</span>
              </button>
              <button
                onClick={() => onSwitchView('orbit')}
                className="flex-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-medium border border-yellow-500/30 transition-colors flex items-center justify-center gap-1.5"
                title="Explore this node's mandala radial orbit"
              >
                <span>🪐 View in Orbit</span>
              </button>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span
                className="text-xs rounded px-2 py-0.5 font-semibold text-gray-950 capitalize"
                style={{ backgroundColor: domainColor }}
              >
                {node.domain}
              </span>
              <span className="text-xs bg-gray-800 text-gray-300 rounded px-2 py-0.5">
                {node.category}
              </span>
              <span className="text-xs bg-gray-800 text-gray-300 rounded px-2 py-0.5 capitalize">
                {node.tier}
              </span>
              <span
                className={`text-xs rounded px-2 py-0.5 ${
                  confidenceColor[node.confidence] ?? 'bg-gray-600 text-gray-200'
                }`}
              >
                {node.confidence}
              </span>
            </div>

            {/* Connection Topology Summary */}
            {relBreakdown.length > 0 && (
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1.5">
                  Topology Connections ({edges.length} Links)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {relBreakdown.map(([rel, count]) => {
                    const color =
                      RELATIONSHIP_COLORS[rel as keyof typeof RELATIONSHIP_COLORS] || '#6B7280';
                    return (
                      <span
                        key={rel}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-gray-950 border text-gray-300 flex items-center gap-1.5"
                        style={{ borderColor: `${color}66` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="capitalize">{rel.replace(/_/g, ' ')}</span>
                        <strong className="text-white font-mono">{count}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Historical Context */}
            {node.historicalContext && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-1 font-bold">
                  Historical Context
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{node.historicalContext}</p>
              </section>
            )}

            {/* Explanation */}
            {node.explanation && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-1 font-bold">
                  Explanation
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{node.explanation}</p>
              </section>
            )}

            {/* Sanskrit Passages */}
            {node.sanskritPassages && node.sanskritPassages.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-2 font-bold">
                  Sanskrit Passages
                </h3>
                {node.sanskritPassages.map((passage, i) => (
                  <SanskritPassage key={i} passage={passage} />
                ))}
              </section>
            )}

            {/* Sources */}
            {node.sources && node.sources.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-2 font-bold">
                  Sources
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {node.sources.map((src, i) => (
                    <SourceBadge key={i} source={src} />
                  ))}
                </div>
              </section>
            )}

            {/* Scholarly Notes — collapsible */}
            {node.scholarlyNotes && (
              <section>
                <button
                  onClick={() => setScholarsOpen((o) => !o)}
                  className="text-xs uppercase tracking-widest text-yellow-500 flex items-center gap-1 w-full text-left font-bold"
                >
                  <span>Scholarly Notes</span>
                  <span>{scholarsOpen ? '▲' : '▼'}</span>
                </button>
                {scholarsOpen && (
                  <p className="text-sm text-gray-400 leading-relaxed mt-2 italic">
                    {node.scholarlyNotes}
                  </p>
                )}
              </section>
            )}

            {/* Related Nodes */}
            <RelatedNodes node={node} onNavigateTo={onNavigateTo} />
          </div>
        </>
      )}
    </div>
  );
}

function RelatedNodes({
  node,
  onNavigateTo,
}: {
  node: KnowledgeNode;
  onNavigateTo: (n: KnowledgeNode) => void;
}) {
  const edges = getEdgesForNode(node.id);
  if (edges.length === 0) return null;

  // Deduplicate by related node id
  const seen = new Set<string>();
  const uniqueRelated: Array<{ edge: KnowledgeEdge; related: KnowledgeNode }> = [];
  for (const edge of edges) {
    const relatedId = edge.source === node.id ? edge.target : edge.source;
    if (!seen.has(relatedId)) {
      seen.add(relatedId);
      const related = getNodeById(relatedId);
      if (related) uniqueRelated.push({ edge, related });
    }
  }

  if (uniqueRelated.length === 0) return null;

  return (
    <section>
      <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-2 font-bold">Related</h3>
      <div className="space-y-1">
        {uniqueRelated.map(({ edge, related }) => (
          <button
            key={related.id}
            onClick={() => onNavigateTo(related)}
            className="w-full text-left text-sm text-gray-300 hover:text-yellow-300 flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[related.domain] }} />
              <span className="font-medium truncate">{related.nameEnglish}</span>
              <span className="font-devanagari text-xs text-yellow-400/80">
                {related.nameDevanagari}
              </span>
            </div>
            <span className="text-[11px] text-gray-500 capitalize flex-shrink-0">
              {edge.relationship.replace(/_/g, ' ')}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
