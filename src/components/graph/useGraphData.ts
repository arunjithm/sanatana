import { useMemo } from 'react';
import type {
  GraphData, GraphNode, GraphEdge, Domain, DomainId, RelationshipType,
} from '@/types/knowledge';
import { getAllNodes, getAllEdges, getAllDomains } from '@/data/repository';

export const DOMAIN_COLORS: Record<DomainId, string> = {
  shruti: '#FFD700',
  smriti: '#FF8C00',
  purana: '#C084FC',
  darshana: '#60A5FA',
  agama: '#F472B6',
  deity: '#FCD34D',
  concept: '#A3E635',
  sage: '#34D399',
  vedanga: '#94A3B8',
  upaveda: '#FB923C',
  science_art: '#E879F9',
};

export const TIER_SIZES: Record<string, number> = {
  galaxy: 12,
  solar: 8,
  planet: 5,
  moon: 3,
};

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  explains: '#60A5FA',
  influences: '#FFD700',
  contradicts: '#F87171',
  mentions: '#6B7280',
  quotes: '#6B7280',
  interprets: '#6B7280',
  comments_on: '#6B7280',
  shares_concept_with: '#6B7280',
  belongs_to_tradition: '#6B7280',
  attributed_to: '#6B7280',
};

/** Pure function — exported for testing */
export function buildGraphData(activeDomains: Set<DomainId>): GraphData {
  if (activeDomains.size === 0) {
    return { nodes: [], links: [] };
  }

  const allNodes = getAllNodes();
  const allEdges = getAllEdges();

  const filteredNodes: GraphNode[] = allNodes
    .filter(n => activeDomains.has(n.domain))
    .map(n => ({
      ...n,
      color: DOMAIN_COLORS[n.domain],
      size: TIER_SIZES[n.tier] ?? 3,
    }));

  const nodeIdSet = new Set(filteredNodes.map(n => n.id));

  const filteredLinks: GraphEdge[] = allEdges
    .filter(e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target))
    .map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      relationship: e.relationship,
      weight: e.weight,
      color: RELATIONSHIP_COLORS[e.relationship] ?? '#6B7280',
    }));

  return { nodes: filteredNodes, links: filteredLinks };
}

export function useGraphData(activeDomains: Set<DomainId>): {
  graphData: GraphData;
  isLoading: boolean;
  domains: Domain[];
} {
  const domains = useMemo(() => getAllDomains(), []);
  const graphData = useMemo(() => buildGraphData(activeDomains), [activeDomains]);
  return { graphData, isLoading: false, domains };
}
