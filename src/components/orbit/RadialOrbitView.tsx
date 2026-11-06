'use client';

import React, { useMemo, useState } from 'react';
import type { KnowledgeNode, KnowledgeEdge } from '@/types/knowledge';
import { getAllNodes, getEdgesForNode, getNodeById } from '@/data/repository';
import { DOMAIN_COLORS, RELATIONSHIP_COLORS } from '@/components/graph/useGraphData';

interface RadialOrbitViewProps {
  centerNode: KnowledgeNode | null;
  onSelectNode: (node: KnowledgeNode) => void;
}

interface OrbitRingConfig {
  ringIndex: number;
  label: string;
  labelDevanagari: string;
  radius: number;
  color: string;
  relationships: string[];
}

const RINGS: OrbitRingConfig[] = [
  {
    ringIndex: 1,
    label: 'Foundational Lineage',
    labelDevanagari: 'मूल परम्परा',
    radius: 150,
    color: '#60A5FA', // Azure
    relationships: ['explains', 'belongs_to_tradition', 'attributed_to'],
  },
  {
    ringIndex: 2,
    label: 'Intellectual Discourse',
    labelDevanagari: 'विमर्श व प्रभाव',
    radius: 250,
    color: '#FFD700', // Gold
    relationships: ['influences', 'interprets', 'comments_on'],
  },
  {
    ringIndex: 3,
    label: 'Thematic Resonance',
    labelDevanagari: 'समान संकल्पना',
    radius: 340,
    color: '#C084FC', // Purple
    relationships: ['shares_concept_with', 'mentions', 'quotes'],
  },
  {
    ringIndex: 4,
    label: 'Philosophical Debates',
    labelDevanagari: 'विचार भेद',
    radius: 420,
    color: '#F87171', // Red
    relationships: ['contradicts'],
  },
];

export function RadialOrbitView({ centerNode, onSelectNode }: RadialOrbitViewProps) {
  const allNodes = useMemo(() => getAllNodes(), []);

  // Default to Brahman or Rigveda if no node is selected yet
  const activeCenter = useMemo(() => {
    if (centerNode) return centerNode;
    return getNodeById('concept-brahman') || allNodes[0];
  }, [centerNode, allNodes]);

  const [hoveredNode, setHoveredNode] = useState<{ node: KnowledgeNode; edge: KnowledgeEdge } | null>(null);

  // Extract all connected nodes and partition into the 4 orbital rings
  const ringNodes = useMemo(() => {
    if (!activeCenter) return { 1: [], 2: [], 3: [], 4: [] };

    const edges = getEdgesForNode(activeCenter.id);
    const result: Record<number, Array<{ node: KnowledgeNode; edge: KnowledgeEdge }>> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    const seenNodeIds = new Set<string>();

    for (const edge of edges) {
      const neighborId = edge.source === activeCenter.id ? edge.target : edge.source;
      if (seenNodeIds.has(neighborId)) continue;
      seenNodeIds.add(neighborId);

      const neighbor = getNodeById(neighborId);
      if (!neighbor) continue;

      // Classify into ring
      let assignedRing = 3; // Default
      for (const ring of RINGS) {
        if (ring.relationships.includes(edge.relationship)) {
          assignedRing = ring.ringIndex;
          break;
        }
      }

      result[assignedRing].push({ node: neighbor, edge });
    }

    return result;
  }, [activeCenter]);

  // Center canvas dimensions
  const canvasSize = 920;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;

  return (
    <div className="w-full h-full bg-[#050510] flex flex-col overflow-hidden relative">
      {/* Top Header */}
      <div className="h-14 border-b border-gray-800/80 bg-gray-950/80 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="font-devanagari text-lg text-yellow-400 font-bold">मण्डल कक्ष्याः</span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Radial Ego-Network & Gravitational Orbit of Connected Concepts
          </span>
        </div>

        {/* Quick Node Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Center:</span>
          <select
            value={activeCenter.id}
            onChange={(e) => {
              const node = getNodeById(e.target.value);
              if (node) onSelectNode(node);
            }}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:outline-none focus:border-yellow-500 font-medium"
          >
            {allNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nameEnglish} ({n.nameDevanagari})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orbit Visualization Canvas Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 relative">
        {/* Hover info tooltip */}
        {hoveredNode && (
          <div className="absolute top-4 left-6 z-30 p-3.5 rounded-xl bg-gray-950/90 border border-yellow-500/50 backdrop-blur-md shadow-2xl max-w-sm pointer-events-none">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: DOMAIN_COLORS[hoveredNode.node.domain] }}
              />
              <span className="font-devanagari text-yellow-400 text-sm font-semibold">
                {hoveredNode.node.nameDevanagari}
              </span>
              <span className="text-white text-xs font-bold">{hoveredNode.node.nameEnglish}</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-1 capitalize">
              Relation: <strong className="text-yellow-300">{hoveredNode.edge.relationship.replace(/_/g, ' ')}</strong> (Weight: {hoveredNode.edge.weight}/10)
            </div>
            <div className="text-[11px] text-gray-300 mt-1 line-clamp-2">
              {hoveredNode.node.explanation}
            </div>
          </div>
        )}

        <svg width={canvasSize} height={canvasSize} className="overflow-visible">
          {/* Subtle background cosmic grid / mandala rays */}
          {[0, 30, 60, 90, 120, 150].map((deg) => (
            <line
              key={deg}
              x1={cx + Math.cos((deg * Math.PI) / 180) * 440}
              y1={cy + Math.sin((deg * Math.PI) / 180) * 440}
              x2={cx - Math.cos((deg * Math.PI) / 180) * 440}
              y2={cy - Math.sin((deg * Math.PI) / 180) * 440}
              stroke="rgba(255, 255, 255, 0.03)"
              strokeDasharray="4 6"
            />
          ))}

          {/* 4 Concentric Orbital Rings */}
          {RINGS.map((ring) => (
            <g key={ring.ringIndex}>
              <circle
                cx={cx}
                cy={cy}
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeOpacity={0.2}
                strokeWidth={1.5}
                strokeDasharray="6 6"
              />
              {/* Ring Label along top edge */}
              <text
                x={cx}
                y={cy - ring.radius + 14}
                fill={ring.color}
                fillOpacity={0.6}
                fontSize="10"
                textAnchor="middle"
                className="font-medium tracking-wider"
              >
                {ring.labelDevanagari} • {ring.label}
              </text>
            </g>
          ))}

          {/* Connection Lines from Center to Satellites */}
          {RINGS.flatMap((ring) => {
            const satellites = ringNodes[ring.ringIndex] || [];
            const count = satellites.length;
            if (count === 0) return [];

            return satellites.map((item, i) => {
              const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
              const sx = cx + ring.radius * Math.cos(angle);
              const sy = cy + ring.radius * Math.sin(angle);
              const edgeColor = RELATIONSHIP_COLORS[item.edge.relationship] || ring.color;

              return (
                <line
                  key={`line-${item.node.id}`}
                  x1={cx}
                  y1={cy}
                  x2={sx}
                  y2={sy}
                  stroke={edgeColor}
                  strokeOpacity={0.25}
                  strokeWidth={1.2}
                />
              );
            });
          })}

          {/* Satellite Nodes */}
          {RINGS.flatMap((ring) => {
            const satellites = ringNodes[ring.ringIndex] || [];
            const count = satellites.length;
            if (count === 0) return [];

            return satellites.map((item, i) => {
              const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
              const sx = cx + ring.radius * Math.cos(angle);
              const sy = cy + ring.radius * Math.sin(angle);
              const domainColor = DOMAIN_COLORS[item.node.domain] || '#ffffff';

              return (
                <g
                  key={`node-${item.node.id}`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  onClick={() => onSelectNode(item.node)}
                  onMouseEnter={() => setHoveredNode(item)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Outer glow ring */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={16}
                    fill={domainColor}
                    fillOpacity={0.2}
                    stroke={domainColor}
                    strokeWidth={1.5}
                  />
                  {/* Inner Core */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={10}
                    fill={domainColor}
                  />
                  {/* Label */}
                  <text
                    x={sx}
                    y={sy + 26}
                    fill="#e2e8f0"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-medium drop-shadow-md select-none pointer-events-none"
                  >
                    {item.node.nameEnglish}
                  </text>
                  <text
                    x={sx}
                    y={sy + 37}
                    fill="#ffd700"
                    fontSize="9"
                    textAnchor="middle"
                    className="font-devanagari select-none pointer-events-none opacity-80"
                  >
                    {item.node.nameDevanagari}
                  </text>
                </g>
              );
            });
          })}

          {/* Central Sun Node (Bindu) */}
          <g className="cursor-pointer" onClick={() => onSelectNode(activeCenter)}>
            {/* Pulsing Aura */}
            <circle
              cx={cx}
              cy={cy}
              r={46}
              fill={DOMAIN_COLORS[activeCenter.domain] || '#ffd700'}
              fillOpacity={0.25}
              className="animate-pulse"
            />
            <circle
              cx={cx}
              cy={cy}
              r={36}
              fill="#0a0a1a"
              stroke="#ffd700"
              strokeWidth={3}
            />
            {/* Center Core */}
            <circle
              cx={cx}
              cy={cy}
              r={24}
              fill={DOMAIN_COLORS[activeCenter.domain] || '#ffd700'}
            />
            {/* Sanskrit Inscription */}
            <text
              x={cx}
              y={cy - 2}
              fill="#ffffff"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
              className="font-devanagari select-none"
            >
              {activeCenter.nameDevanagari}
            </text>
            <text
              x={cx}
              y={cy + 60}
              fill="#ffffff"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              className="select-none"
            >
              {activeCenter.nameEnglish}
            </text>
            <text
              x={cx}
              y={cy + 76}
              fill="#94a3b8"
              fontSize="11"
              textAnchor="middle"
              className="select-none capitalize"
            >
              {activeCenter.domain} • {activeCenter.tier} Tier
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
