'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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

// Radii for the layout rings
const DOMAIN_RING_R = 280;   // distance from center to domain hub
const NODE_RING_R   = 110;   // distance from domain hub to its leaf nodes

/** Pre-compute fixed (fx, fy) for every node so the graph is a readable radial tree */
function applyRadialLayout(nodes: GraphNode[]): GraphNode[] {
  const CENTER_ID = 'concept-brahman'; // Brahman at the absolute center

  // Gather unique domains from the visible node set
  const domainSet = new Set<string>();
  for (const n of nodes) {
    if (n.id !== CENTER_ID) domainSet.add(n.domain);
  }
  const domains = Array.from(domainSet);
  const domainCount = domains.length;

  // Map domain → { angle, hubX, hubY }
  const domainInfo: Record<string, { hubX: number; hubY: number }> = {};
  domains.forEach((d, i) => {
    const angle = (2 * Math.PI * i) / domainCount - Math.PI / 2; // start at top
    domainInfo[d] = {
      hubX: DOMAIN_RING_R * Math.cos(angle),
      hubY: DOMAIN_RING_R * Math.sin(angle),
    };
  });

  // Count nodes per domain so we can space them evenly
  const domainNodes: Record<string, GraphNode[]> = {};
  for (const n of nodes) {
    if (n.id === CENTER_ID) continue;
    if (!domainNodes[n.domain]) domainNodes[n.domain] = [];
    domainNodes[n.domain].push(n);
  }

  return nodes.map((n) => {
    if (n.id === CENTER_ID) {
      return { ...n, fx: 0, fy: 0, fz: 0 };
    }
    const info = domainInfo[n.domain];
    if (!info) return n;

    const siblings = domainNodes[n.domain] ?? [];
    const idx = siblings.findIndex((s) => s.id === n.id);
    const total = siblings.length;
    // Spread siblings in a half-arc (180°) centred away from origin
    const hubAngle = Math.atan2(info.hubY, info.hubX);
    const spread = total > 1 ? Math.PI * 0.9 : 0;
    const startAngle = hubAngle - spread / 2;
    const leafAngle = total > 1 ? startAngle + (spread * idx) / (total - 1) : hubAngle;

    return {
      ...n,
      fx: info.hubX + NODE_RING_R * Math.cos(leafAngle),
      fy: info.hubY + NODE_RING_R * Math.sin(leafAngle),
      fz: 0,
    };
  });
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

  // Apply radial layout to nodes whenever data changes
  const layoutData = useMemo(() => {
    if (!graphData) return graphData;
    return {
      nodes: applyRadialLayout(graphData.nodes as GraphNode[]),
      links: graphData.links,
    };
  }, [graphData]);

  useEffect(() => {
    setMobile(isMobile());
    const onResize = () => {
      setDimensions(getSize());
      setMobile(isMobile());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Zoom to fit once layout stabilises (nearly instant since nodes are pinned)
  const handleEngineStop = useCallback(() => {
    if (!graphRef.current) return;
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
    graphData: layoutData,
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
            // Central node is larger
            const isCenter = gNode.id === 'concept-brahman';
            const r = isCenter ? 10 : 6;
            const isHighlighted = hasHighlight && highlightedNodeIds.has(gNode.id);
            const isActive = !hasHighlight || isHighlighted;
            const color = isActive ? (gNode.color ?? '#a78bfa') : 'rgba(255,255,255,0.08)';

            // glow for highlighted or center
            if (isHighlighted || isCenter) {
              ctx.beginPath();
              ctx.arc(gNode.x, gNode.y, r * 2.5, 0, 2 * Math.PI);
              ctx.fillStyle = isCenter ? '#FFD70033' : `${gNode.color ?? '#a78bfa'}33`;
              ctx.fill();
            }

            // node circle
            ctx.beginPath();
            ctx.arc(gNode.x, gNode.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = isCenter ? '#FFD700' : color;
            ctx.fill();

            // label — always visible, scales with zoom
            if (isActive) {
              const label = isCenter ? '🕉 Brahman' : (gNode.nameEnglish ?? '');
              const fontSize = isCenter
                ? Math.min(14, Math.max(8, 11 / globalScale))
                : Math.min(11, Math.max(6, 8 / globalScale));
              ctx.font = `${isCenter ? 'bold ' : ''}${fontSize}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = isCenter ? '#FFD700' : (isHighlighted ? '#fff' : 'rgba(255,255,255,0.75)');
              ctx.fillText(label, gNode.x, gNode.y + r + 2);
            }
          }}
          nodeCanvasObjectMode={() => 'replace'}
          linkWidth={0.5}
          linkDirectionalParticles={0}
          // With fx/fy pinned, the simulation barely needs to run
          d3AlphaDecay={0.5}
          d3VelocityDecay={0.9}
          cooldownTicks={30}
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
          // Fast settle for 3D too
          d3AlphaDecay={0.5}
          d3VelocityDecay={0.9}
          cooldownTicks={30}
        />
      )}
    </div>
  );
}
