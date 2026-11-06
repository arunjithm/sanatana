'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { DomainId, GraphNode, GraphEdge, RelationshipType } from '@/types/knowledge';
import { useGraphData } from './useGraphData';
import type { LabelMode } from './NodeObject';
import { GraphHUD } from './GraphHUD';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

const TOUR_NODE_IDS = [
  'veda-rigveda',
  'concept-brahman',
  'concept-atman',
  'darshana-advaita',
  'concept-moksha',
  'smriti-bhagavad-gita',
  'deity-krishna',
  'concept-karma',
  'deity-shiva',
  'purana-vishnu',
];

interface GraphCanvasProps {
  activeDomains: Set<DomainId>;
  onNodeClick: (node: GraphNode) => void;
  selectedNode?: GraphNode | null;
  highlightedNodeIds?: Set<string>;
}

export default function GraphCanvas({
  activeDomains,
  onNodeClick,
  selectedNode,
  highlightedNodeIds = new Set(),
}: GraphCanvasProps) {
  const { graphData, loading } = useGraphData(activeDomains);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mobile, setMobile] = useState(false);
  const [labelMode, setLabelMode] = useState<LabelMode>('both');
  const [activeRelFilter, setActiveRelFilter] = useState<RelationshipType | 'all'>('all');
  const [isTouring, setIsTouring] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  // Detect mobile and measure container
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
      setMobile(window.innerWidth < 768);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Filter links by active relationship filter
  const filteredGraphData = useMemo(() => {
    if (activeRelFilter === 'all') return graphData;
    return {
      nodes: graphData.nodes,
      links: graphData.links.filter((l) => l.relationship === activeRelFilter),
    };
  }, [graphData, activeRelFilter]);

  const hasHighlight = highlightedNodeIds.size > 0;

  // Canvas node renderer — must be declared before any early return
  const nodeCanvasObject = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gNode = node as GraphNode & { x?: number; y?: number };
      if (gNode.x == null || gNode.y == null) return;
      const isCenter = gNode.id === 'concept-brahman';
      const baseR = mobile ? 6 : 8;
      const r = isCenter ? (mobile ? 10 : 14) : baseR;
      const isHighlighted = hasHighlight && highlightedNodeIds.has(gNode.id);
      const isActive = !hasHighlight || isHighlighted || gNode.id === selectedNode?.id;
      const color = isActive ? (gNode.color ?? '#a78bfa') : 'rgba(255,255,255,0.08)';

      // glow
      if (isHighlighted || isCenter || gNode.id === selectedNode?.id) {
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

      // label
      if (isActive && labelMode !== 'none') {
        const isSelected = gNode.id === selectedNode?.id;
        const maxFs = mobile ? 11 : 13;
        const minFs = mobile ? 6 : 7;
        const baseFs = mobile ? 8 : 10;
        const fontSize = isCenter
          ? Math.min(maxFs + 3, Math.max(minFs, (baseFs + 3) / globalScale))
          : Math.min(maxFs, Math.max(minFs, baseFs / globalScale));
        ctx.font = `${isCenter || isSelected ? 'bold ' : ''}${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isCenter ? '#FFD700' : (isHighlighted || isSelected ? '#fff' : 'rgba(255,255,255,0.75)');

        if (isCenter) {
          ctx.fillText('🕉 Brahman', gNode.x, gNode.y + r + 2);
        } else if (labelMode === 'both') {
          const english = gNode.nameEnglish ?? '';
          const devanagari = (gNode as any).nameSanskrit ?? '';
          ctx.fillText(english, gNode.x, gNode.y + r + 2);
          if (devanagari) {
            ctx.font = `${fontSize * 0.9}px sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fillText(devanagari, gNode.x, gNode.y + r + 2 + fontSize + 1);
          }
        } else if (labelMode === 'english') {
          ctx.fillText(gNode.nameEnglish ?? '', gNode.x, gNode.y + r + 2);
        } else if (labelMode === 'devanagari') {
          ctx.fillText((gNode as any).nameSanskrit ?? gNode.nameEnglish ?? '', gNode.x, gNode.y + r + 2);
        }
      }
    },
    [mobile, hasHighlight, highlightedNodeIds, selectedNode, labelMode]
  );

  // Smooth zoom-to-node on selection
  const flyToNode = useCallback((node: GraphNode) => {
    if (!fgRef.current || !node) return;
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    fgRef.current.centerAt(x, y, 800);
    fgRef.current.zoom(2.5, 800);
  }, []);

  useEffect(() => {
    if (selectedNode) {
      flyToNode(selectedNode);
    }
  }, [selectedNode, flyToNode]);

  // Cosmic Tour
  useEffect(() => {
    if (!isTouring) return;
    const interval = setInterval(() => {
      setTourIndex((prev) => {
        const next = (prev + 1) % TOUR_NODE_IDS.length;
        const targetNode = graphData.nodes.find((n) => n.id === TOUR_NODE_IDS[next]);
        if (targetNode) {
          onNodeClick(targetNode);
          flyToNode(targetNode);
        }
        return next;
      });
    }, 5500);
    return () => clearInterval(interval);
  }, [isTouring, graphData.nodes, onNodeClick, flyToNode]);

  const handleToggleTour = () => {
    if (!isTouring) {
      setIsTouring(true);
      const startNode = graphData.nodes.find((n) => n.id === TOUR_NODE_IDS[tourIndex]);
      if (startNode) {
        onNodeClick(startNode);
        flyToNode(startNode);
      }
    } else {
      setIsTouring(false);
    }
  };

  const handleResetCamera = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000, 50);
    }
  };

  const handleCycleLabelMode = () => {
    const modes: LabelMode[] = ['both', 'english', 'devanagari', 'none'];
    setLabelMode((prev) => modes[(modes.indexOf(prev) + 1) % modes.length]);
  };

  // is2D toggle is cosmetic in 2D renderer — kept for HUD API compatibility
  const [is2D, setIs2D] = useState(true);
  const handleToggle2D = () => setIs2D((prev) => !prev);

  const currentTourNode = isTouring
    ? graphData.nodes.find((n) => n.id === TOUR_NODE_IDS[tourIndex])?.nameEnglish
    : undefined;

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050510] text-yellow-400 gap-3">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-devanagari tracking-widest">ब्रह्माण्डं प्रकाशते...</span>
        <span className="text-xs text-gray-400">Illuminating the Knowledge Universe...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <GraphHUD
        labelMode={labelMode}
        onCycleLabelMode={handleCycleLabelMode}
        onResetCamera={handleResetCamera}
        isTouring={isTouring}
        onToggleTour={handleToggleTour}
        tourNodeName={currentTourNode}
        activeRelFilter={activeRelFilter}
        onSelectRelFilter={setActiveRelFilter}
        is2D={is2D}
        onToggle2D={handleToggle2D}
      />

      <ForceGraph2D
        ref={fgRef}
        graphData={filteredGraphData}
        backgroundColor="#050510"
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => 'replace'}
        nodeLabel="nameEnglish"
        linkColor={(link) => (link as GraphEdge).color ?? 'rgba(255,255,255,0.25)'}
        linkWidth={(link) => Math.max(((link as GraphEdge).weight ?? 5) / 5, 0.8)}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={1.8}
        linkDirectionalParticleColor={(link) => (link as GraphEdge).color ?? '#ffd700'}
        onNodeClick={(node) => {
          setIsTouring(false);
          onNodeClick(node as GraphNode);
        }}
      />
    </div>
  );
}
