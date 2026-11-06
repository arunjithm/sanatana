'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import type { DomainId, GraphNode, GraphEdge, RelationshipType } from '@/types/knowledge';
import { useGraphData } from './useGraphData';
import { createNodeObject, LabelMode } from './NodeObject';
import { GraphHUD } from './GraphHUD';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

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
  const [labelMode, setLabelMode] = useState<LabelMode>('both');
  const [activeRelFilter, setActiveRelFilter] = useState<RelationshipType | 'all'>('all');
  const [is2D, setIs2D] = useState(false);
  const [isTouring, setIsTouring] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  const starfieldAdded = useRef(false);

  // Resize observer
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

  // Filter links by active relationship filter
  const filteredGraphData = useMemo(() => {
    if (activeRelFilter === 'all') return graphData;
    return {
      nodes: graphData.nodes,
      links: graphData.links.filter((l) => l.relationship === activeRelFilter),
    };
  }, [graphData, activeRelFilter]);

  // Inject procedural cosmic starfield into Three.js scene
  const setupStarfield = useCallback(() => {
    if (fgRef.current && !starfieldAdded.current) {
      const scene = fgRef.current.scene();
      if (!scene) return;

      const starCount = 1800;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount * 3; i += 3) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 700 + Math.random() * 1100;
        const sinPhi = Math.sin(phi);

        positions[i] = r * sinPhi * Math.cos(theta);
        positions[i + 1] = r * sinPhi * Math.sin(theta);
        positions[i + 2] = r * Math.cos(phi);

        const mix = Math.random();
        if (mix > 0.8) {
          colors[i] = 1.0; colors[i + 1] = 0.85; colors[i + 2] = 0.45; // Golden
        } else if (mix > 0.6) {
          colors[i] = 0.65; colors[i + 1] = 0.85; colors[i + 2] = 1.0; // Cyan
        } else {
          colors[i] = 0.95; colors[i + 1] = 0.95; colors[i + 2] = 0.98; // Silvery white
        }
      }

      const starsGeo = new THREE.BufferGeometry();
      starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const starsMat = new THREE.PointsMaterial({
        size: 2.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });

      const starField = new THREE.Points(starsGeo, starsMat);
      scene.add(starField);
      starfieldAdded.current = true;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(setupStarfield, 500);
    return () => clearTimeout(timer);
  }, [setupStarfield, loading]);

  // Smooth camera fly-to on node selection
  const flyToNode = useCallback((node: GraphNode) => {
    if (!fgRef.current || !node) return;
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const z = node.z ?? 0;

    const currentPos = fgRef.current.cameraPosition();
    const distance = 80;
    const len = Math.hypot(x, y, z) || 1;
    const camX = x + (x / len) * distance;
    const camY = y + (y / len) * distance;
    const camZ = is2D ? currentPos.z : z + ((z || 1) / len) * distance;

    fgRef.current.cameraPosition(
      { x: camX, y: camY, z: camZ },
      { x, y, z },
      1400
    );
  }, [is2D]);

  // Trigger camera flight whenever selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      flyToNode(selectedNode);
    }
  }, [selectedNode, flyToNode]);

  // Handle Cosmic Tour interval
  useEffect(() => {
    if (!isTouring) return;

    const interval = setInterval(() => {
      setTourIndex((prev) => {
        const next = (prev + 1) % TOUR_NODE_IDS.length;
        const targetId = TOUR_NODE_IDS[next];
        const targetNode = graphData.nodes.find((n) => n.id === targetId);
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
      const startId = TOUR_NODE_IDS[tourIndex];
      const startNode = graphData.nodes.find((n) => n.id === startId);
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
    const nextIdx = (modes.indexOf(labelMode) + 1) % modes.length;
    setLabelMode(modes[nextIdx]);
  };

  const handleToggle2D = () => {
    setIs2D((prev) => !prev);
  };

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

  const hasHighlight = highlightedNodeIds.size > 0;

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

      <ForceGraph3D
        ref={fgRef}
        graphData={filteredGraphData}
        backgroundColor="#050510"
        width={dimensions.width}
        height={dimensions.height}
        numDimensions={is2D ? 2 : 3}
        nodeThreeObject={(node) => {
          const gNode = node as GraphNode;
          const isSelected = selectedNode?.id === gNode.id;
          const isHighlighted = highlightedNodeIds ? highlightedNodeIds.has(gNode.id) : false;
          const isDimmed = hasHighlight && !isHighlighted && !isSelected;
          return createNodeObject(gNode, {
            highlighted: isHighlighted,
            selected: isSelected,
            dimmed: isDimmed,
            labelMode,
          });
        }}
        nodeThreeObjectExtend={false}
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
