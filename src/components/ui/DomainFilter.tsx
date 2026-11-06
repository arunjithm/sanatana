'use client';

import { useState } from 'react';
import { getAllDomains } from '@/data/repository';
import type { DomainId } from '@/types/knowledge';

interface DomainFilterProps {
  activeDomains: Set<DomainId>;
  onToggle: (id: DomainId) => void;
  onReset: () => void;
}

export function DomainFilter({ activeDomains, onToggle, onReset }: DomainFilterProps) {
  const [open, setOpen] = useState(false);
  const domains = getAllDomains();
  const allActive = activeDomains.size === domains.length;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 16, zIndex: 50 }}>
      {/* Drawer */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            right: 0,
            background: 'rgba(10,10,30,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            padding: '12px 14px',
            minWidth: 200,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Filter by domain
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {domains.map((domain) => {
              const isActive = activeDomains.has(domain.id);
              return (
                <button
                  key={domain.id}
                  onClick={() => onToggle(domain.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 2px',
                    textAlign: 'left',
                    opacity: isActive ? 1 : 0.4,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: domain.color,
                      flexShrink: 0,
                      border: isActive ? `2px solid ${domain.color}` : '2px solid rgba(255,255,255,0.3)',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: isActive ? 500 : 400 }}>
                    {domain.name}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 10, paddingTop: 10 }}>
            <button
              onClick={onReset}
              style={{
                fontSize: 12,
                color: allActive ? '#666' : '#a78bfa',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {allActive ? 'All domains shown' : 'Show all domains'}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: open ? 'rgba(167,139,250,0.3)' : 'rgba(10,10,30,0.9)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          transition: 'background 0.2s',
        }}
        title="Filter domains"
      >
        🔮
      </button>
    </div>
  );
}
