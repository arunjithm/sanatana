'use client';

import React, { useState, useMemo } from 'react';
import type { KnowledgeNode, DomainId } from '@/types/knowledge';
import { getAllNodes } from '@/data/repository';
import { DOMAIN_COLORS } from '@/components/graph/useGraphData';

interface TimelineViewProps {
  onSelectNode: (node: KnowledgeNode) => void;
  selectedNode?: KnowledgeNode | null;
  activeDomains: Set<DomainId>;
}

interface Era {
  id: string;
  nameDevanagari: string;
  nameEnglish: string;
  period: string;
  color: string;
  description: string;
  philosophicalShift: string;
  nodeIds: string[];
}

const ERAS: Era[] = [
  {
    id: 'early-vedic',
    nameDevanagari: 'प्रारम्भिक वैदिक कालः',
    nameEnglish: 'Early Vedic Dawn',
    period: 'c. 1500 – 1200 BCE',
    color: '#FFD700',
    description: 'Composition of the Rigveda Samhita hymns celebrating cosmic natural powers and order.',
    philosophicalShift: 'Conception of Ṛta (cosmic harmonic order) and early intuitive vision of the unified One behind many gods ("Ekam Sat Vipra Bahudha Vadanti").',
    nodeIds: ['veda-rigveda', 'samhita-rigveda', 'deity-agni', 'deity-indra', 'deity-varuna', 'deity-surya', 'concept-rita', 'concept-tapas'],
  },
  {
    id: 'later-vedic',
    nameDevanagari: 'उत्तर वैदिक कालः',
    nameEnglish: 'Later Vedic & Liturgical Era',
    period: 'c. 1200 – 800 BCE',
    color: '#F59E0B',
    description: 'Systematization of Samaveda, Yajurveda, and Atharvaveda with liturgical Brahmanas and early Aranyakas.',
    philosophicalShift: 'Deepening of sacred ritual correspondences (Bandhus), sacred sound vibrations, and early introspective forest treatises.',
    nodeIds: ['veda-samaveda', 'veda-yajurveda', 'veda-atharvaveda', 'samhita-samaveda', 'samhita-yajurveda', 'samhita-atharvaveda', 'concept-aum', 'concept-dharma'],
  },
  {
    id: 'axial-upanishad',
    nameDevanagari: 'उपनिषद् युगः (ज्ञानकाण्डः)',
    nameEnglish: 'Upanishadic Axial Age',
    period: 'c. 800 – 500 BCE',
    color: '#10B981',
    description: 'The monumental inward turn from ritualism to self-realization across the Principal Upanishads.',
    philosophicalShift: 'Discovery of the ultimate identity or non-difference of Atman (Inner Self) and Brahman (Cosmic Absolute). Formulation of Samsara, Karma, and Moksha.',
    nodeIds: [
      'upanishad-brihadaranyaka',
      'upanishad-chandogya',
      'upanishad-katha',
      'upanishad-isha',
      'upanishad-mandukya',
      'upanishad-mundaka',
      'upanishad-taittiriya',
      'upanishad-kena',
      'concept-brahman',
      'concept-atman',
      'concept-moksha',
      'concept-maya',
      'sage-yajnavalkya',
    ],
  },
  {
    id: 'sutra-epic',
    nameDevanagari: 'सूत्र व इतिहास कालः',
    nameEnglish: 'Sutra & Epic Synthesis',
    period: 'c. 500 BCE – 200 CE',
    color: '#8B5CF6',
    description: 'Codification of the 6 Vedanga auxiliary sciences and the epics Ramayana and Mahabharata, including the Bhagavad Gita.',
    philosophicalShift: 'Synthesis of the three paths (Jnana, Bhakti, Karma Yoga). Universalization of ethical duty (Svadharmacarana) and devotion to the Supreme Being.',
    nodeIds: [
      'smriti-mahabharata',
      'smriti-ramayana',
      'smriti-bhagavad-gita',
      'smriti-manusmriti',
      'sage-vyasa',
      'sage-valmiki',
      'deity-krishna',
      'deity-rama',
      'vedanga-shiksha',
      'vedanga-vyakarana',
      'vedanga-kalpa',
      'vedanga-nirukta',
      'vedanga-chandas',
      'vedanga-jyotisha',
    ],
  },
  {
    id: 'classical-darshana',
    nameDevanagari: 'षड्दर्शन सूत्र कालः',
    nameEnglish: 'Classical Darshana Codification',
    period: 'c. 200 BCE – 500 CE',
    color: '#3B82F6',
    description: 'Rigorous philosophical formulation of the six Astika systems through foundational aphorisms (Sutras).',
    philosophicalShift: 'Systematic epistemology (Pramanas), atomic physics, category theory, dualistic psychology, and non-dual dialectics.',
    nodeIds: [
      'darshana-nyaya',
      'darshana-vaisheshika',
      'darshana-samkhya',
      'darshana-yoga-school',
      'darshana-mimamsa',
      'darshana-advaita',
      'sage-kapila',
      'sage-patanjali',
      'sage-panini',
      'sage-vyasa',
      'concept-yoga',
      'concept-jnana',
    ],
  },
  {
    id: 'puranic-renaissance',
    nameDevanagari: 'पौराणिक व भक्ति कालः',
    nameEnglish: 'Puranic & Bhakti Consolidation',
    period: 'c. 300 – 1000 CE',
    color: '#EC4899',
    description: 'Flourishing of the 18 Mahapuranas, Temple Agamas, and popular theological devotion.',
    philosophicalShift: 'Elaboration of cosmological cycles (Kalpas, Yugas), divine descents (Avatars), and accessible devotional paths for all aspirants.',
    nodeIds: [
      'purana-vishnu',
      'purana-shiva',
      'purana-bhagavata',
      'purana-markandeya',
      'purana-garuda',
      'deity-vishnu',
      'deity-shiva',
      'deity-brahma',
      'deity-devi',
      'deity-ganesha',
      'deity-murugan',
    ],
  },
  {
    id: 'scholastic-acharya',
    nameDevanagari: 'आचार्य भाष्य कालः',
    nameEnglish: 'Scholastic Acharya Renaissance',
    period: 'c. 700 – 1600 CE',
    color: '#F43F5E',
    description: 'Monumental commentaries (Bhashyas) on the Prasthanatrayi and emergence of distinct Vedanta traditions.',
    philosophicalShift: 'Intense dialectical engagement between Advaita (Shankara), Vishishtadvaita (Ramanuja), and Dvaita (Madhva).',
    nodeIds: [
      'darshana-advaita',
      'darshana-vishishtadvaita',
      'darshana-dvaita',
      'sage-adi-shankaracharya',
      'sage-ramanujacharya',
      'sage-madhvacharya',
    ],
  },
];

export function TimelineView({ onSelectNode, selectedNode, activeDomains }: TimelineViewProps) {
  const allNodes = useMemo(() => getAllNodes(), []);
  const nodeMap = useMemo(() => {
    const map = new Map<string, KnowledgeNode>();
    allNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [allNodes]);

  const [activeEraId, setActiveEraId] = useState<string>('all');

  const visibleEras = useMemo(() => {
    if (activeEraId === 'all') return ERAS;
    return ERAS.filter((e) => e.id === activeEraId);
  }, [activeEraId]);

  return (
    <div className="w-full h-full bg-[#050510] flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-14 border-b border-gray-800/80 bg-gray-950/80 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="font-devanagari text-lg text-yellow-400 font-bold">कालक्रम प्रवाहः</span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Chronological Flow of Texts, Sages, and Metaphysical Paradigms
          </span>
        </div>

        {/* Era Selector Filter */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs py-1">
          <button
            onClick={() => setActiveEraId('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeEraId === 'all'
                ? 'bg-yellow-500 text-gray-950 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            All 7 Eras
          </button>
          {ERAS.map((era) => (
            <button
              key={era.id}
              onClick={() => setActiveEraId(era.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeEraId === era.id
                  ? 'bg-yellow-500 text-gray-950 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {era.nameEnglish.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timeline Stream */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
        <div className="max-w-5xl mx-auto relative border-l-2 border-yellow-500/20 ml-4 md:ml-32 space-y-12">
          {visibleEras.map((era) => {
            const eraNodes = era.nodeIds
              .map((id) => nodeMap.get(id))
              .filter(Boolean) as KnowledgeNode[];

            return (
              <div key={era.id} className="relative pl-6 md:pl-10 group">
                {/* Timeline Dot Marker */}
                <div
                  className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-gray-950 transition-all group-hover:scale-125"
                  style={{ backgroundColor: era.color, boxShadow: `0 0 12px ${era.color}` }}
                />

                {/* Period Stamp on Left on larger screens */}
                <div className="hidden md:block absolute -left-36 top-1.5 text-right w-28">
                  <span className="text-xs font-mono text-gray-400 font-semibold">{era.period}</span>
                </div>

                {/* Era Content Card */}
                <div className="p-6 rounded-2xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md shadow-xl hover:border-gray-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-800/60 pb-3">
                    <div>
                      <span className="font-devanagari text-xl text-yellow-300 font-bold">
                        {era.nameDevanagari}
                      </span>
                      <h3 className="text-base font-semibold text-white mt-0.5">{era.nameEnglish}</h3>
                    </div>
                    <span className="text-xs font-mono text-yellow-500/90 font-medium sm:text-right">
                      {era.period}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mt-3 leading-relaxed">{era.description}</p>

                  {/* Breakthrough Quote */}
                  <div className="mt-3.5 p-3 rounded-xl bg-gray-900/60 border-l-2 border-yellow-500 text-xs text-gray-300 italic">
                    <strong className="text-yellow-400 not-italic mr-1.5">Philosophical Landmark:</strong>
                    {era.philosophicalShift}
                  </div>

                  {/* Nodes in this Era */}
                  <div className="mt-4">
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-2">
                      Key Texts, Seers & Concepts:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {eraNodes.map((node) => {
                        const isSelected = selectedNode?.id === node.id;
                        const isDomainActive = activeDomains.has(node.domain);
                        const domainColor = DOMAIN_COLORS[node.domain] ?? '#ffffff';

                        return (
                          <button
                            key={node.id}
                            onClick={() => onSelectNode(node)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
                              isSelected
                                ? 'bg-yellow-500/20 border-yellow-400 text-white shadow-md'
                                : !isDomainActive
                                ? 'opacity-30 bg-gray-900/40 border-gray-800 text-gray-500'
                                : 'bg-gray-900 hover:bg-gray-800 border-gray-800 hover:border-gray-600 text-gray-200'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: domainColor }}
                            />
                            <span className="font-devanagari text-yellow-400/90">
                              {node.nameDevanagari}
                            </span>
                            <span>{node.nameEnglish}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
