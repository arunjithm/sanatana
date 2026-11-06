'use client';

import React, { useState, useMemo } from 'react';
import type { KnowledgeNode, DomainId } from '@/types/knowledge';
import { getAllNodes } from '@/data/repository';
import { DOMAIN_COLORS } from '@/components/graph/useGraphData';

interface VedaVrikshaProps {
  onSelectNode: (node: KnowledgeNode) => void;
  selectedNode?: KnowledgeNode | null;
  activeDomains: Set<DomainId>;
  highlightedNodeIds?: Set<string>;
}

interface TreeNode {
  id: string;
  nameDevanagari: string;
  nameEnglish: string;
  domain?: DomainId;
  nodeData?: KnowledgeNode;
  children?: TreeNode[];
  tier?: string;
}

export function VedaVriksha({
  onSelectNode,
  selectedNode,
  activeDomains,
  highlightedNodeIds = new Set(),
}: VedaVrikshaProps) {
  const allNodes = useMemo(() => getAllNodes(), []);

  // Set of collapsed node IDs
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsedIds(new Set());
  const collapseAll = () => {
    const allBranchIds = ['shruti', 'vedanga', 'darshana', 'smriti', 'purana', 'sage', 'concept'];
    setCollapsedIds(new Set(allBranchIds));
  };

  // Build canonical Vedic Tree
  const treeData = useMemo<TreeNode>(() => {
    const nodeMap = new Map<string, KnowledgeNode>();
    allNodes.forEach((n) => nodeMap.set(n.id, n));

    const findNode = (id: string) => nodeMap.get(id);

    const makeLeaf = (node?: KnowledgeNode): TreeNode | null => {
      if (!node) return null;
      return {
        id: node.id,
        nameDevanagari: node.nameDevanagari,
        nameEnglish: node.nameEnglish,
        domain: node.domain,
        tier: node.tier,
        nodeData: node,
      };
    };

    // 1. Shruti (Rig, Sama, Yajur, Atharva and their Upanishads)
    const rigUpanishads = ['upanishad-aitareya'].map(findNode).map(makeLeaf).filter(Boolean) as TreeNode[];
    const samaUpanishads = ['upanishad-chandogya', 'upanishad-kena'].map(findNode).map(makeLeaf).filter(Boolean) as TreeNode[];
    const yajurUpanishads = ['upanishad-brihadaranyaka', 'upanishad-katha', 'upanishad-isha', 'upanishad-taittiriya', 'upanishad-shvetashvatara'].map(findNode).map(makeLeaf).filter(Boolean) as TreeNode[];
    const atharvaUpanishads = ['upanishad-mandukya', 'upanishad-mundaka', 'upanishad-prashna'].map(findNode).map(makeLeaf).filter(Boolean) as TreeNode[];

    const shrutiChildren: TreeNode[] = [
      {
        id: 'branch-rig',
        nameDevanagari: 'ऋग्वेद शाखा',
        nameEnglish: 'Rigveda Tradition',
        nodeData: findNode('veda-rigveda'),
        children: [
          makeLeaf(findNode('samhita-rigveda')),
          {
            id: 'rig-upanishads',
            nameDevanagari: 'उपनिषदः',
            nameEnglish: 'Upanishads',
            children: rigUpanishads,
          },
        ].filter(Boolean) as TreeNode[],
      },
      {
        id: 'branch-sama',
        nameDevanagari: 'सामवेद शाखा',
        nameEnglish: 'Samaveda Tradition',
        nodeData: findNode('veda-samaveda'),
        children: [
          makeLeaf(findNode('samhita-samaveda')),
          {
            id: 'sama-upanishads',
            nameDevanagari: 'उपनिषदः',
            nameEnglish: 'Upanishads',
            children: samaUpanishads,
          },
        ].filter(Boolean) as TreeNode[],
      },
      {
        id: 'branch-yajur',
        nameDevanagari: 'यजुर्वेद शाखा',
        nameEnglish: 'Yajurveda Tradition',
        nodeData: findNode('veda-yajurveda'),
        children: [
          makeLeaf(findNode('samhita-yajurveda')),
          {
            id: 'yajur-upanishads',
            nameDevanagari: 'उपनिषदः',
            nameEnglish: 'Upanishads',
            children: yajurUpanishads,
          },
        ].filter(Boolean) as TreeNode[],
      },
      {
        id: 'branch-atharva',
        nameDevanagari: 'अथर्ववेद शाखा',
        nameEnglish: 'Atharvaveda Tradition',
        nodeData: findNode('veda-atharvaveda'),
        children: [
          makeLeaf(findNode('samhita-atharvaveda')),
          {
            id: 'atharva-upanishads',
            nameDevanagari: 'उपनिषदः',
            nameEnglish: 'Upanishads',
            children: atharvaUpanishads,
          },
        ].filter(Boolean) as TreeNode[],
      },
    ];

    // 2. Vedangas (6 Limbs)
    const vedangas = allNodes
      .filter((n) => n.domain === 'vedanga')
      .map(makeLeaf)
      .filter(Boolean) as TreeNode[];

    // 3. Shad-Darshanas
    const astikaDarshanas = allNodes
      .filter((n) => n.domain === 'darshana' && n.category === 'Astika School')
      .map((d) => {
        const subTraditions = allNodes
          .filter((sub) => sub.domain === 'darshana' && sub.category === 'Vedanta Sub-school' && d.id.includes('vedanta'))
          .map(makeLeaf)
          .filter(Boolean) as TreeNode[];
        return {
          id: d.id,
          nameDevanagari: d.nameDevanagari,
          nameEnglish: d.nameEnglish,
          domain: d.domain,
          nodeData: d,
          children: subTraditions.length > 0 ? subTraditions : undefined,
        };
      });

    // 4. Smriti & Itihasa
    const smritis = allNodes
      .filter((n) => n.domain === 'smriti')
      .map(makeLeaf)
      .filter(Boolean) as TreeNode[];

    // 5. Puranas
    const puranas = allNodes
      .filter((n) => n.domain === 'purana')
      .map(makeLeaf)
      .filter(Boolean) as TreeNode[];

    // 6. Sages & Rishis
    const sages = allNodes
      .filter((n) => n.domain === 'sage')
      .map(makeLeaf)
      .filter(Boolean) as TreeNode[];

    // 7. Foundational Concepts
    const concepts = allNodes
      .filter((n) => n.domain === 'concept')
      .map(makeLeaf)
      .filter(Boolean) as TreeNode[];

    return {
      id: 'root-tree',
      nameDevanagari: 'सनातन वेद वृक्षाः',
      nameEnglish: 'The Eternal Tree of Vedic Knowledge',
      children: [
        {
          id: 'shruti',
          nameDevanagari: 'श्रुति (अपौरुषेय)',
          nameEnglish: 'Shruti (Revealed Canon)',
          domain: 'shruti',
          children: shrutiChildren,
        },
        {
          id: 'vedanga',
          nameDevanagari: 'षड्वेदाङ्ग (वेदाङ्गानि)',
          nameEnglish: 'Vedangas (6 Auxiliary Limbs)',
          domain: 'vedanga',
          children: vedangas,
        },
        {
          id: 'darshana',
          nameDevanagari: 'षड्दर्शन (आस्तिक दर्शनानि)',
          nameEnglish: 'Shad-Darshanas (6 Philosophical Schools)',
          domain: 'darshana',
          children: astikaDarshanas,
        },
        {
          id: 'smriti',
          nameDevanagari: 'स्मृति व इतिहास',
          nameEnglish: 'Smriti & Itihasa (Tradition & Epics)',
          domain: 'smriti',
          children: smritis,
        },
        {
          id: 'purana',
          nameDevanagari: 'अष्टादश महापुराणानि',
          nameEnglish: 'Puranas (Sacred Chronicles)',
          domain: 'purana',
          children: puranas,
        },
        {
          id: 'sage',
          nameDevanagari: 'ऋषयः व आचार्याः',
          nameEnglish: 'Rishis & Acharyas (Seers & Masters)',
          domain: 'sage',
          children: sages,
        },
        {
          id: 'concept',
          nameDevanagari: 'मूल संकल्पनाः',
          nameEnglish: 'Foundational Concepts (Tattvas)',
          domain: 'concept',
          children: concepts,
        },
      ],
    };
  }, [allNodes]);

  // Filter root branches if selectedBranch !== 'all'
  const visibleTree = useMemo<TreeNode>(() => {
    if (selectedBranch === 'all') return treeData;
    return {
      ...treeData,
      children: treeData.children?.filter((c) => c.id === selectedBranch) ?? [],
    };
  }, [treeData, selectedBranch]);

  // Recursive Tree Node Renderer
  const renderTree = (node: TreeNode, depth = 0) => {
    const isCollapsed = collapsedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;
    const isHighlighted = highlightedNodeIds.has(node.id);
    const domainColor = node.domain ? DOMAIN_COLORS[node.domain] : '#ffd700';

    // If node is associated with a domain that is currently disabled, dim it
    const isDomainActive = !node.domain || activeDomains.has(node.domain);

    return (
      <div key={node.id} className="relative flex flex-col items-start my-1.5 transition-all">
        {/* Node Card */}
        <div
          onClick={() => {
            if (node.nodeData) onSelectNode(node.nodeData);
          }}
          className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border ${
            isSelected
              ? 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-105'
              : isHighlighted
              ? 'bg-amber-900/40 border-amber-400 shadow-md'
              : !isDomainActive
              ? 'opacity-30 bg-gray-950/40 border-gray-800'
              : 'bg-gray-900/80 hover:bg-gray-800/90 border-gray-800 hover:border-gray-600'
          }`}
          style={{
            borderLeft: `4px solid ${domainColor}`,
          }}
        >
          {/* Collapse/Expand toggle button */}
          {hasChildren && (
            <button
              onClick={(e) => toggleCollapse(node.id, e)}
              className="w-5 h-5 flex items-center justify-center rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono transition-colors"
              title={isCollapsed ? 'Expand branch' : 'Collapse branch'}
            >
              {isCollapsed ? '+' : '−'}
            </button>
          )}

          <div className="flex flex-col">
            <span className="font-devanagari text-sm font-semibold text-yellow-300 tracking-wide leading-tight">
              {node.nameDevanagari}
            </span>
            <span className="text-xs text-gray-300 group-hover:text-white font-medium">
              {node.nameEnglish}
            </span>
          </div>

          {node.tier && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 capitalize ml-1">
              {node.tier}
            </span>
          )}

          {node.nodeData && (
            <span className="text-xs text-gray-500 group-hover:text-yellow-400 transition-colors ml-1">
              →
            </span>
          )}
        </div>

        {/* Children branch with vertical connector guideline */}
        {hasChildren && !isCollapsed && (
          <div className="relative pl-6 mt-1 border-l-2 border-yellow-500/20 ml-4 flex flex-col space-y-1">
            {node.children!.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-[#050510] overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="h-14 border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <span className="font-devanagari text-lg text-yellow-400 font-bold">वेदवृक्षः</span>
          <span className="text-xs text-gray-400 hidden sm:inline">The Sacred Tree of Vedic Knowledge Taxonomy</span>
        </div>

        {/* Branch Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-xl text-xs py-1">
          <button
            onClick={() => setSelectedBranch('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
              selectedBranch === 'all'
                ? 'bg-yellow-500 text-gray-950 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Whole Tree
          </button>
          {treeData.children?.map((branch) => (
            <button
              key={branch.id}
              onClick={() => setSelectedBranch(branch.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors truncate max-w-[120px] font-medium ${
                selectedBranch === branch.id
                  ? 'bg-yellow-500 text-gray-950 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={branch.nameEnglish}
            >
              {branch.nameEnglish.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Zoom and Expand Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={expandAll}
            className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Expand all branches"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Collapse to main branches"
          >
            Collapse All
          </button>
          <div className="w-px h-4 bg-gray-800" />
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200"
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
            title="Reset zoom"
          >
            100%
          </button>
        </div>
      </div>

      {/* Tree Visualization Scroll Canvas */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div
          className="transition-transform duration-200 origin-top-left inline-block min-w-full pb-28"
          style={{ transform: `scale(${zoom})` }}
        >
          {renderTree(visibleTree)}
        </div>
      </div>
    </div>
  );
}
