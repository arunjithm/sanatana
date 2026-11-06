'use client';

import React from 'react';
import type { LabelMode } from './NodeObject';
import type { RelationshipType } from '@/types/knowledge';

interface GraphHUDProps {
  labelMode: LabelMode;
  onCycleLabelMode: () => void;
  onResetCamera: () => void;
  isTouring: boolean;
  onToggleTour: () => void;
  tourNodeName?: string;
  activeRelFilter: RelationshipType | 'all';
  onSelectRelFilter: (rel: RelationshipType | 'all') => void;
  is2D: boolean;
  onToggle2D: () => void;
}

const RELATIONSHIPS: Array<{ id: RelationshipType | 'all'; label: string }> = [
  { id: 'all', label: 'All Links' },
  { id: 'explains', label: 'Explains' },
  { id: 'influences', label: 'Influences' },
  { id: 'contradicts', label: 'Contradicts' },
  { id: 'shares_concept_with', label: 'Shared Concept' },
  { id: 'belongs_to_tradition', label: 'Tradition' },
];

export function GraphHUD({
  labelMode,
  onCycleLabelMode,
  onResetCamera,
  isTouring,
  onToggleTour,
  tourNodeName,
  activeRelFilter,
  onSelectRelFilter,
  is2D,
  onToggle2D,
}: GraphHUDProps) {
  const labelModeText: Record<LabelMode, string> = {
    both: 'Labels: All',
    english: 'Labels: English',
    devanagari: 'Labels: Sanskrit',
    none: 'Labels: Off',
  };

  return (
    <div className="absolute top-20 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
      {/* Auto-Tour active indicator pill */}
      {isTouring && tourNodeName && (
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-xs backdrop-blur-md animate-pulse">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          <span>Cosmic Tour: <strong>{tourNodeName}</strong></span>
        </div>
      )}

      {/* Control Pills Container */}
      <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md shadow-xl text-xs">
        {/* Auto Tour Button */}
        <button
          onClick={onToggleTour}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            isTouring
              ? 'bg-yellow-500 text-gray-950 shadow-md shadow-yellow-500/30'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
          title="Start automated cosmic flythrough tour"
        >
          <span>{isTouring ? '⏹ Stop Tour' : '▶ Cosmic Tour'}</span>
        </button>

        <div className="w-px h-4 bg-gray-800" />

        {/* Label Mode Switcher */}
        <button
          onClick={onCycleLabelMode}
          className="px-2.5 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          title="Cycle through label display modes"
        >
          {labelModeText[labelMode]}
        </button>

        <div className="w-px h-4 bg-gray-800" />

        {/* 2D / 3D Toggle */}
        <button
          onClick={onToggle2D}
          className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
            is2D ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
          title="Toggle between 3D spherical space and 2D planar projection"
        >
          {is2D ? '2D Plane' : '3D Orbit'}
        </button>

        <div className="w-px h-4 bg-gray-800" />

        {/* Reset Camera */}
        <button
          onClick={onResetCamera}
          className="px-2.5 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          title="Reset camera zoom and center"
        >
          Reset Camera
        </button>
      </div>

      {/* Link Filter Row */}
      <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-lg bg-gray-950/70 border border-gray-800/60 backdrop-blur-sm text-[11px]">
        <span className="text-gray-500 px-1.5 font-medium">Links:</span>
        {RELATIONSHIPS.map((rel) => {
          const isActive = activeRelFilter === rel.id;
          return (
            <button
              key={rel.id}
              onClick={() => onSelectRelFilter(rel.id)}
              className={`px-2 py-0.5 rounded transition-colors ${
                isActive
                  ? 'bg-yellow-500/20 text-yellow-300 font-semibold border border-yellow-500/40'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              {rel.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
