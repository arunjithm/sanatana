'use client';

import React from 'react';

export type ViewMode = 'cosmic' | 'tree' | 'darshana' | 'timeline' | 'orbit' | 'analytics';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  selectedNodeName?: string;
  onClearSelectedNode?: () => void;
}

interface ViewTab {
  id: ViewMode;
  icon: string;
  name: string;
  shortcut: string;
  tagline: string;
}

const TABS: ViewTab[] = [
  { id: 'cosmic', icon: '🌌', name: 'Cosmic 3D', shortcut: '1', tagline: '3D Celestial Force Graph' },
  { id: 'tree', icon: '🌳', name: 'Veda Vriksha', shortcut: '2', tagline: 'Hierarchical Knowledge Tree' },
  { id: 'darshana', icon: '☸️', name: 'Shad-Darshana', shortcut: '3', tagline: 'Comparative Philosophy & Radar' },
  { id: 'timeline', icon: '⏳', name: 'Chronology', shortcut: '4', tagline: 'Historical Yuga Timeline' },
  { id: 'orbit', icon: '🪐', name: 'Radial Orbit', shortcut: '5', tagline: 'Mandala Ego-Network' },
  { id: 'analytics', icon: '📊', name: 'Analytics', shortcut: '6', tagline: 'Hub Centrality & Topology' },
];

export function ViewSwitcher({
  currentView,
  onSelectView,
  selectedNodeName,
  onClearSelectedNode,
}: ViewSwitcherProps) {
  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 max-w-[95vw]">
      {/* Visual Mode Navigation Bar */}
      <nav
        aria-label="Visualization views"
        className="flex items-center gap-1 p-1.5 rounded-2xl bg-gray-950/85 border border-gray-800/80 backdrop-blur-xl shadow-2xl"
      >
        {TABS.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id)}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 select-none ${
                isActive
                  ? 'bg-yellow-500 text-gray-950 shadow-lg shadow-yellow-500/25 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
              }`}
              title={`${tab.tagline} (Press ${tab.shortcut})`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.name}</span>
              <span
                className={`text-[9px] font-mono px-1 py-0.2 rounded hidden md:inline ${
                  isActive ? 'bg-yellow-600/40 text-gray-950 font-bold' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {tab.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Selected Node Status Pill */}
      {selectedNodeName && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-950/80 border border-yellow-500/40 text-xs backdrop-blur-md text-yellow-300">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <span className="truncate max-w-[140px] font-medium">{selectedNodeName}</span>
          {onClearSelectedNode && (
            <button
              onClick={onClearSelectedNode}
              className="hover:text-white text-gray-400 ml-1 text-sm font-bold"
              title="Deselect node"
            >
              ×
            </button>
          )}
        </div>
      )}
    </header>
  );
}
