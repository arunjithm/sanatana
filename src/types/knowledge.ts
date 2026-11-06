export type DomainId =
  | 'shruti' | 'smriti' | 'purana' | 'vedanga'
  | 'upaveda' | 'darshana' | 'agama'
  | 'deity' | 'sage' | 'concept' | 'science_art';

export type NodeTier = 'galaxy' | 'solar' | 'planet' | 'moon';

export type RelationshipType =
  | 'mentions' | 'quotes' | 'explains' | 'interprets'
  | 'comments_on' | 'influences' | 'shares_concept_with'
  | 'contradicts' | 'belongs_to_tradition' | 'attributed_to';

export type ConfidenceLevel =
  | 'established' | 'traditional' | 'disputed' | 'uncertain';

export interface SourceReference {
  text: string;
  section?: string;
  recension?: string;
}

export interface SanskritPassage {
  sanskrit: string;
  transliteration: string;
  translation: string;
  source: SourceReference;
}

export interface KnowledgeNode {
  id: string;
  slug: string;
  nameDevanagari: string;
  nameTransliteration: string;
  nameEnglish: string;
  meaningEnglish: string;
  domain: DomainId;
  category: string;
  tier: NodeTier;
  historicalContext: string;
  explanation: string;
  sanskritPassages?: SanskritPassage[];
  sources: SourceReference[];
  confidence: ConfidenceLevel;
  scholarlyNotes?: string;
  color?: string;
  size?: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relationship: RelationshipType;
  label?: string;
  weight: number;
  bidirectional: boolean;
  notes?: string;
}

export interface Domain {
  id: DomainId;
  name: string;
  nameDevanagari: string;
  color: string;
  description: string;
}

// Graph-ready shapes consumed by react-force-graph-3d
export interface GraphNode extends KnowledgeNode {
  x?: number; y?: number; z?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: RelationshipType;
  weight: number;
  color?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}
