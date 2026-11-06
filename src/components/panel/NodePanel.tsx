'use client';

import { useState, useEffect } from 'react';
import type { KnowledgeNode, KnowledgeEdge } from '@/types/knowledge';
import { getEdgesForNode, getNodeById } from '@/data/repository';
import { SourceBadge } from './SourceBadge';
import { SanskritPassage } from './SanskritPassage';

interface NodePanelProps {
  node: KnowledgeNode | null;
  onClose: () => void;
  onNavigateTo: (node: KnowledgeNode) => void;
}

const confidenceColor: Record<string, string> = {
  established: 'bg-green-700 text-green-100',
  traditional: 'bg-blue-700 text-blue-100',
  disputed: 'bg-orange-700 text-orange-100',
  uncertain: 'bg-gray-600 text-gray-200',
};

export function NodePanel({ node, onClose, onNavigateTo }: NodePanelProps) {
  const [scholarsOpen, setScholarsOpen] = useState(false);

  useEffect(() => { setScholarsOpen(false); }, [node?.id]);

  const isOpen = node !== null;

  return (
    <div
      className={`fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        background: '#0a0a1a',
        borderTop: '3px solid #FFD700',
        width: 'min(100vw, 384px)',
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}
    >
      {node && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-gray-800" style={{ minWidth: 0 }}>
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-2xl text-yellow-400 font-devanagari leading-tight truncate">{node.nameDevanagari}</div>
              <div className="text-sm italic text-gray-400 mt-0.5 truncate">{node.nameTransliteration}</div>
              <div className="text-base text-white mt-1 font-medium">{node.nameEnglish}</div>
              {node.meaningEnglish && (
                <div className="text-sm text-gray-300 mt-0.5">{node.meaningEnglish}</div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white leading-none flex-shrink-0"
              aria-label="Close panel"
              style={{ fontSize: 28, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs bg-gray-800 text-gray-300 rounded px-2 py-0.5">{node.domain}</span>
              <span className="text-xs bg-gray-800 text-gray-300 rounded px-2 py-0.5">{node.category}</span>
              <span className="text-xs bg-gray-800 text-gray-300 rounded px-2 py-0.5">{node.tier}</span>
              <span className={`text-xs rounded px-2 py-0.5 ${confidenceColor[node.confidence] ?? 'bg-gray-600 text-gray-200'}`}>
                {node.confidence}
              </span>
            </div>

            {/* Historical Context */}
            {node.historicalContext && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-1">Historical Context</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{node.historicalContext}</p>
              </section>
            )}

            {/* Explanation */}
            {node.explanation && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-1">Explanation</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{node.explanation}</p>
              </section>
            )}

            {/* Sanskrit Passages — render nothing if undefined or empty */}
            {node.sanskritPassages && node.sanskritPassages.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Sanskrit Passages</h3>
                {node.sanskritPassages.map((passage, i) => (
                  <SanskritPassage key={i} passage={passage} />
                ))}
              </section>
            )}

            {/* Sources */}
            {node.sources && node.sources.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Sources</h3>
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
                  className="text-xs uppercase tracking-widest text-yellow-500 flex items-center gap-1 w-full text-left"
                >
                  <span>Scholarly Notes</span>
                  <span>{scholarsOpen ? '▲' : '▼'}</span>
                </button>
                {scholarsOpen && (
                  <p className="text-sm text-gray-400 leading-relaxed mt-2 italic">{node.scholarlyNotes}</p>
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

function RelatedNodes({ node, onNavigateTo }: { node: KnowledgeNode; onNavigateTo: (n: KnowledgeNode) => void }) {
  const edges = getEdgesForNode(node.id);
  if (edges.length === 0) return null;

  // Deduplicate by related node id (bidirectional edges appear twice)
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
      <h3 className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Related</h3>
      <div className="space-y-1">
        {uniqueRelated.map(({ edge, related }) => (
          <button
            key={related.id}
            onClick={() => onNavigateTo(related)}
            className="w-full text-left text-sm text-gray-300 hover:text-yellow-300 flex items-center gap-2 py-0.5"
          >
            <span className="text-xs text-gray-500 capitalize">{edge.relationship.replace(/_/g, ' ')}</span>
            <span className="font-medium">{related.nameEnglish}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
