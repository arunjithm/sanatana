'use client';

import { getAllDomains } from '@/data/repository';
import type { DomainId } from '@/types/knowledge';

interface DomainFilterProps {
  activeDomains: Set<DomainId>;
  onToggle: (id: DomainId) => void;
  onReset: () => void;
}

export function DomainFilter({ activeDomains, onToggle, onReset }: DomainFilterProps) {
  const domains = getAllDomains();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center z-50 px-4">
      {domains.map((domain) => {
        const isActive = activeDomains.has(domain.id);
        return (
          <button
            key={domain.id}
            onClick={() => onToggle(domain.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
            style={isActive ? { backgroundColor: domain.color } : undefined}
            title={domain.nameDevanagari}
          >
            {domain.name}
          </button>
        );
      })}
      <button
        onClick={onReset}
        className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition-all"
      >
        Reset
      </button>
    </div>
  );
}
