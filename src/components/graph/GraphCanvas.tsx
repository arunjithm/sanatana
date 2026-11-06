'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { DomainId, GraphNode, GraphEdge } from '@/types/knowledge';
import { useGraphData } from './useGraphData';
import { createNodeObject } from './NodeObject';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface GraphCanvasProps {
  activeDomains: Set<DomainId>;
  onNodeClick: (node: GraphNode) => void;
  highlightedNodeIds?: Set<string>;
}

export default function GraphCanvas({
  activeDomains,
  onNodeClick,
  highlightedNodeIds = new Set(),
}: GraphCanvasProps) {
  const { graphData, loading } = useGraphData(activeDomains);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const lowPerf =
    typeof navigator !== 'undefined' && navigator.hardwareConcurrency < 4;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: '#050510',
        }}
      >
        Loading…
      </div>
    );
  }

  const hasHighlight = highlightedNodeIds.size > 0;

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <ForceGraph3D
        graphData={graphData}
        backgroundColor="#050510"
        width={dimensions.width}
        height={dimensions.height}
        nodeThreeObject={(node) => {
          const gNode = node as GraphNode;
          const isHighlighted = highlightedNodeIds ? highlightedNodeIds.has(gNode.id) : false;
          const isDimmed = highlightedNodeIds && highlightedNodeIds.size > 0 && !highlightedNodeIds.has(gNode.id);
          return createNodeObject(gNode, { highlighted: isHighlighted, dimmed: isDimmed });
        }}
        nodeThreeObjectExtend={false}
        nodeLabel="nameEnglish"
        nodeColor={(node) => {
          if (!hasHighlight) return (node as GraphNode).color ?? '#ffffff';
          return highlightedNodeIds.has((node as GraphNode).id)
            ? ((node as GraphNode).color ?? '#ffffff')
            : 'rgba(255,255,255,0.3)';
        }}
        linkColor={(link) => (link as GraphEdge).color ?? 'rgba(255,255,255,0.2)'}
        linkWidth={(link) => ((link as GraphEdge).weight ?? 5) / 5}
        linkDirectionalParticles={lowPerf ? 0 : 2}
        linkDirectionalParticleSpeed={0.004}
        onNodeClick={(node) => onNodeClick(node as GraphNode)}
        onNodeRightClick={() => undefined}
      />
    </div>
  );
}
