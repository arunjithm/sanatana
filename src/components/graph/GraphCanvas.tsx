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
  const graphRef = useRef<any>(); // ForceGraph2D ref for zoomToFit

  useEffect(() => {
    setMobile(isMobile());
    const onResize = () => {
      setDimensions(getSize());
      setMobile(isMobile());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Configure force simulation for tight, readable clustering
  const handleEngineStop = useCallback(() => {
    if (!graphRef.current) return;
    // zoom to fit after simulation settles
    graphRef.current.zoomToFit(400, 40);
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
          ref={graphRef}
          {...commonProps}
          nodeRelSize={6}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const gNode = node as GraphNode & { x?: number; y?: number };
            if (gNode.x == null || gNode.y == null) return;
            const r = 6;
            const isHighlighted = hasHighlight && highlightedNodeIds.has(gNode.id);
            const isActive = !hasHighlight || isHighlighted;
            const color = isActive ? (gNode.color ?? '#a78bfa') : 'rgba(255,255,255,0.08)';

            // glow for highlighted
            if (isHighlighted) {
              ctx.beginPath();
              ctx.arc(gNode.x, gNode.y, r * 2.5, 0, 2 * Math.PI);
              ctx.fillStyle = `${gNode.color ?? '#a78bfa'}33`;
              ctx.fill();
            }

            // node circle
            ctx.beginPath();
            ctx.arc(gNode.x, gNode.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();

            // label — always visible, scales with zoom
            if (isActive && globalScale >= 0.6) {
              const label = gNode.nameEnglish ?? '';
              const fontSize = Math.min(12, Math.max(7, 9 / globalScale));
              ctx.font = `${fontSize}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = isHighlighted ? '#fff' : 'rgba(255,255,255,0.7)';
              ctx.fillText(label, gNode.x, gNode.y + r + 2);
            }
          }}
          nodeCanvasObjectMode={() => 'replace'}
          linkWidth={0.6}
          linkDirectionalParticles={0}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.4}
          cooldownTicks={150}
          onEngineStop={handleEngineStop}
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
