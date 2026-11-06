'use client';

import React, { useMemo, useState } from 'react';
import type { KnowledgeNode } from '@/types/knowledge';
import { getAllNodes, getAllEdges, getAllDomains } from '@/data/repository';
import { DOMAIN_COLORS, RELATIONSHIP_COLORS } from '@/components/graph/useGraphData';

interface AnalyticsViewProps {
  onSelectNode: (node: KnowledgeNode) => void;
}

export function AnalyticsView({ onSelectNode }: AnalyticsViewProps) {
  const nodes = useMemo(() => getAllNodes(), []);
  const edges = useMemo(() => getAllEdges(), []);
  const domains = useMemo(() => getAllDomains(), []);

  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  // 1. Calculate Hub Centrality (Degree Centrality)
  const topHubs = useMemo(() => {
    const degreeMap = new Map<string, number>();
    edges.forEach((e) => {
      degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
    });

    const nodeDegrees = nodes.map((n) => ({
      node: n,
      degree: degreeMap.get(n.id) || 0,
    }));

    return nodeDegrees.sort((a, b) => b.degree - a.degree).slice(0, 10);
  }, [nodes, edges]);

  // 2. Domain Distribution Counts
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach((n) => {
      counts[n.domain] = (counts[n.domain] || 0) + 1;
    });
    return domains
      .map((d) => ({
        id: d.id,
        name: d.name,
        nameDevanagari: d.nameDevanagari,
        color: d.color,
        count: counts[d.id] || 0,
        pct: (((counts[d.id] || 0) / nodes.length) * 100).toFixed(1),
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [nodes, domains]);

  // 3. Relationship Distribution Counts
  const relCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    edges.forEach((e) => {
      counts[e.relationship] = (counts[e.relationship] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([rel, count]) => ({
        rel,
        count,
        color: RELATIONSHIP_COLORS[rel as keyof typeof RELATIONSHIP_COLORS] || '#6B7280',
        pct: ((count / edges.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  }, [edges]);

  // 4. Tier Counts
  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach((n) => {
      counts[n.tier] = (counts[n.tier] || 0) + 1;
    });
    return counts;
  }, [nodes]);

  // 5. Confidence Counts
  const confidenceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach((n) => {
      counts[n.confidence] = (counts[n.confidence] || 0) + 1;
    });
    return counts;
  }, [nodes]);

  // Donut chart calculations
  const donutSize = 220;
  const radius = 80;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;
  const donutSlices = domainCounts.map((d) => {
    const sliceAngle = (d.count / nodes.length) * 360;
    const strokeDasharray = `${(d.count / nodes.length) * circumference} ${circumference}`;
    const strokeDashoffset = -(cumulativeAngle / 360) * circumference;
    cumulativeAngle += sliceAngle;
    return {
      ...d,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="w-full h-full bg-[#050510] flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-14 border-b border-gray-800/80 bg-gray-950/80 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="font-devanagari text-lg text-yellow-400 font-bold">ज्ञान साङ्ख्यिकी</span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Graph Topology, Knowledge Hub Centrality & Canonical Distributions
          </span>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 pb-28">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Total Nodes</span>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{nodes.length}</div>
            <span className="text-[11px] text-gray-400">Canonical entities</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Total Edges</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{edges.length}</div>
            <span className="text-[11px] text-gray-400">Relationship links</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Avg Degree</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {((edges.length * 2) / nodes.length).toFixed(1)}
            </div>
            <span className="text-[11px] text-gray-400">Connections / node</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Galaxy Hubs</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{tierCounts['galaxy'] || 8}</div>
            <span className="text-[11px] text-gray-400">Supreme cosmic tiers</span>
          </div>
        </div>

        {/* Middle Row: Centrality Hubs + Domain Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top 10 Hubs (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Top Knowledge Hubs (Degree Centrality)</h3>
                <span className="text-xs text-gray-400">The most interconnected concepts, texts, and seers</span>
              </div>
              <span className="text-xs font-mono text-yellow-400">Edges</span>
            </div>

            <div className="space-y-2.5">
              {topHubs.map(({ node, degree }) => {
                const maxDegree = topHubs[0]?.degree || 1;
                const widthPct = (degree / maxDegree) * 100;
                const domainColor = DOMAIN_COLORS[node.domain] || '#ffffff';

                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode(node)}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-gray-900/80 cursor-pointer transition-all border border-transparent hover:border-gray-800"
                  >
                    <div className="w-40 flex-shrink-0 flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: domainColor }} />
                        <span className="text-xs font-semibold text-gray-200 group-hover:text-yellow-300 truncate">
                          {node.nameEnglish}
                        </span>
                      </div>
                      <span className="font-devanagari text-[10px] text-gray-400 pl-3.5">
                        {node.nameDevanagari}
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 h-3 rounded-full bg-gray-900 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: domainColor,
                          boxShadow: `0 0 8px ${domainColor}88`,
                        }}
                      />
                    </div>

                    <span className="text-xs font-mono font-bold text-gray-300 w-8 text-right">
                      {degree}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Domain Distribution Donut (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md shadow-xl flex flex-col items-center">
            <h3 className="text-sm font-semibold text-white w-full text-left mb-1">
              Domain Composition
            </h3>
            <span className="text-xs text-gray-400 w-full text-left mb-4">
              Distribution of entities across 9 domains
            </span>

            <div className="relative my-2">
              <svg width={donutSize} height={donutSize} className="-rotate-90">
                {donutSlices.map((slice) => (
                  <circle
                    key={slice.id}
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer hover:opacity-80"
                    onMouseEnter={() => setHoveredDomain(slice.id)}
                    onMouseLeave={() => setHoveredDomain(null)}
                  />
                ))}
              </svg>

              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white font-mono">{nodes.length}</span>
                <span className="text-[11px] text-gray-400 uppercase tracking-widest">Nodes</span>
              </div>
            </div>

            {/* Domain legend grid */}
            <div className="grid grid-cols-2 gap-2 w-full mt-4 text-xs">
              {domainCounts.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between p-1.5 rounded-lg border transition-colors ${
                    hoveredDomain === d.id
                      ? 'bg-gray-800 border-yellow-500/50'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate text-gray-200 font-medium">{d.name}</span>
                  </div>
                  <span className="font-mono text-gray-400 ml-1">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Relationships & Confidence Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Relationship Distribution (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white mb-1">
              Relationship Typology (411 Links)
            </h3>
            <span className="text-xs text-gray-400 block mb-4">
              Structural ontology connecting canonical knowledge
            </span>

            <div className="space-y-2">
              {relCounts.map((r) => (
                <div key={r.rel} className="flex items-center gap-3 text-xs">
                  <span className="w-36 text-gray-300 font-medium capitalize truncate">
                    {r.rel.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-900 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.pct}%`,
                        backgroundColor: r.color,
                      }}
                    />
                  </div>
                  <span className="font-mono text-gray-400 w-12 text-right">
                    {r.count} ({r.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier & Confidence Breakdown (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Cosmic Tier Stratification</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(tierCounts).map(([tier, count]) => (
                  <div key={tier} className="p-2.5 rounded-lg bg-gray-900/70 border border-gray-800 flex justify-between items-center">
                    <span className="capitalize font-medium text-gray-300">{tier}</span>
                    <span className="font-mono font-bold text-yellow-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Scholarly Confidence</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(confidenceCounts).map(([conf, count]) => (
                  <div key={conf} className="p-2.5 rounded-lg bg-gray-900/70 border border-gray-800 flex justify-between items-center">
                    <span className="capitalize font-medium text-gray-300">{conf}</span>
                    <span className="font-mono font-bold text-emerald-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
