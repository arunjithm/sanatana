'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { DomainId, GraphNode, GraphEdge } from '@/types/knowledge';
import { useGraphData } from './useGraphData';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface GraphCanvasProps {
  activeDomains: Set<DomainId>;
  onNodeClick: (node: GraphNode) => void;
  highlightedNodeIds?: Set<string>;
}

function getSize() {
  if (typeof window === 'undefined') return { width: 390, height: 700 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
}

export default function GraphCanvas({
  activeDomains,
  onNodeClick,
  highlightedNodeIds = new Set(),
}: GraphCanvasProps) {
  const { graphData, loading } = useGraphData(activeDomains);
  const [dimensions, setDimensions] = useState(getSize);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobile());
    const onResize = () => {
      setDimensions(getSize());
      setMobile(isMobile());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleNodeClick = useCallback(
    (node: object) => onNodeClick(node as GraphNode),
    [onNodeClick]
  );

  const hasHighlight = highlightedNodeIds.size > 0;

  const nodeColor = useCallback(
    (node: object) => {
      const gNode = node as GraphNode;
      if (!hasHighlight) return gNode.color ?? '#ffffff';
      return highlightedNodeIds.has(gNode.id)
        ? (gNode.color ?? '#ffffff')
        : 'rgba(255,255,255,0.15)';
    },
    [hasHighlight, highlightedNodeIds]
  );

  const linkColor = useCallback(
    (link: object) => (link as GraphEdge).color ?? 'rgba(255,255,255,0.15)',
    []
  );

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#050510', color: '#a78bfa',
        fontSize: 14, gap: 12,
      }}>
        <div style={{ fontSize: 32 }}>🕉</div>
        <div>Loading the Knowledge Universe…</div>
      </div>
    );
  }

  const commonProps = {
    graphData,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: '#050510',
    nodeLabel: 'nameEnglish',
    nodeColor,
    linkColor,
    onNodeClick: handleNodeClick,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, touchAction: 'none' }}>
      {mobile ? (
        <ForceGraph2D
          {...commonProps}
          nodeRelSize={5}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const gNode = node as GraphNode & { x?: number; y?: number };
            if (gNode.x == null || gNode.y == null) return;
            const r = 5;
            const color = hasHighlight
              ? highlightedNodeIds.has(gNode.id) ? (gNode.color ?? '#fff') : 'rgba(255,255,255,0.15)'
              : (gNode.color ?? '#fff');
            ctx.beginPath();
            ctx.arc(gNode.x, gNode.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            if (globalScale >= 2) {
              ctx.font = `${10 / globalScale}px sans-serif`;
              ctx.fillStyle = '#fff';
              ctx.textAlign = 'center';
              ctx.fillText(gNode.nameEnglish ?? '', gNode.x, gNode.y + r + 4);
            }
          }}
          nodeCanvasObjectMode={() => 'replace'}
          linkWidth={1}
          linkDirectionalParticles={0}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTicks={80}
        />
      ) : (
        <ForceGraph3D
          {...commonProps}
          nodeLabel="nameEnglish"
          linkWidth={(link) => ((link as GraphEdge).weight ?? 5) / 5}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          onNodeRightClick={() => undefined}
        />
      )}
    </div>
  );
}
