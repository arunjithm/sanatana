import type { KnowledgeNode, KnowledgeEdge, Domain, DomainId } from '@/types/knowledge';

import shrutiNodes from '@/data/nodes/shruti.json';
import smritiNodes from '@/data/nodes/smriti.json';
import puranaNodes from '@/data/nodes/purana.json';
import vedangaNodes from '@/data/nodes/vedanga.json';
import darshanaNodes from '@/data/nodes/darshana.json';
import deityNodes from '@/data/nodes/deity.json';
import sageNodes from '@/data/nodes/sage.json';
import conceptNodes from '@/data/nodes/concept.json';
import edgesData from '@/data/edges.json';
import domainsData from '@/data/domains.json';

// Cache variables — computed once
let _allNodes: KnowledgeNode[] | null = null;
let _allEdges: KnowledgeEdge[] | null = null;
let _allDomains: Domain[] | null = null;

export function getAllNodes(): KnowledgeNode[] {
  if (_allNodes === null) {
    _allNodes = [
      ...shrutiNodes,
      ...smritiNodes,
      ...puranaNodes,
      ...vedangaNodes,
      ...darshanaNodes,
      ...deityNodes,
      ...sageNodes,
      ...conceptNodes,
    ] as KnowledgeNode[];
  }
  return _allNodes;
}

export function getAllEdges(): KnowledgeEdge[] {
  if (_allEdges === null) {
    _allEdges = edgesData as KnowledgeEdge[];
  }
  return _allEdges;
}

export function getAllDomains(): Domain[] {
  if (_allDomains === null) {
    _allDomains = domainsData as Domain[];
  }
  return _allDomains;
}

export function getNodeById(id: string): KnowledgeNode | undefined {
  return getAllNodes().find(n => n.id === id);
}

export function getNodesByDomain(domainId: DomainId): KnowledgeNode[] {
  return getAllNodes().filter(n => n.domain === domainId);
}

export function getEdgesForNode(nodeId: string): KnowledgeEdge[] {
  return getAllEdges().filter(e => e.source === nodeId || e.target === nodeId);
}

export function validateGraph(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodes = getAllNodes();
  const edges = getAllEdges();
  const domains = getAllDomains();

  const nodeIds = new Set(nodes.map(n => n.id));
  const validDomainIds = new Set(domains.map(d => d.id));

  // Check all edge endpoints reference existing nodes
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id}: source '${edge.source}' does not reference an existing node`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id}: target '${edge.target}' does not reference an existing node`);
    }
  }

  // Check all nodes have non-empty sources
  for (const node of nodes) {
    if (!node.sources || node.sources.length === 0) {
      errors.push(`Node ${node.id}: has empty sources array`);
    }
  }

  // Check all node domain IDs are valid
  for (const node of nodes) {
    if (!validDomainIds.has(node.domain)) {
      errors.push(`Node ${node.id}: domain '${node.domain}' is not a valid DomainId`);
    }
  }

  return { valid: errors.length === 0, errors };
}
