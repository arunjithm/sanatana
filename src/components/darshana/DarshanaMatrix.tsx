'use client';

import React, { useState } from 'react';
import type { KnowledgeNode } from '@/types/knowledge';
import { getNodeById } from '@/data/repository';

interface DarshanaMatrixProps {
  onSelectNode: (node: KnowledgeNode) => void;
  selectedNode?: KnowledgeNode | null;
}

interface DarshanaProfile {
  id: string;
  nodeId: string;
  nameDevanagari: string;
  nameEnglish: string;
  founder: string;
  founderNodeId: string;
  rootText: string;
  color: string;
  pramanas: string[];
  metaphysics: string;
  ishvaraConcept: string;
  liberation: string;
  coreThesis: string;
  // Metrics 1-10 for radar chart
  radar: {
    epistemology: number; // Pramana count / breadth
    nonDualism: number;   // 1 = Pluralistic realism, 10 = Pure Non-dualism
    theism: number;       // Role of Ishvara
    logic: number;        // Dialectical & syllogistic focus
    contemplation: number;// Experiential yoga/meditation focus
    hermeneutics: number; // Vedic textual exegesis focus
  };
}

const DARSHANAS: DarshanaProfile[] = [
  {
    id: 'nyaya',
    nodeId: 'darshana-nyaya',
    nameDevanagari: 'न्याय',
    nameEnglish: 'Nyaya',
    founder: 'Sage Gautama (Akṣapāda)',
    founderNodeId: 'sage-gautama',
    rootText: 'Nyāya Sūtras',
    color: '#60A5FA', // Azure
    pramanas: ['Pratyaksha (Perception)', 'Anumana (Inference)', 'Upamana (Comparison)', 'Shabda (Testimony)'],
    metaphysics: 'Pluralistic Realism (Independent objective reality with 16 knowable topics)',
    ishvaraConcept: 'Efficient cause of the universe; moral supervisor of karma',
    liberation: 'Apavarga — Cessation of all pain and suffering through right knowledge (tattva-jnana)',
    coreThesis: 'Valid knowledge (prama) through 16 dialectical categories ends ignorance and rebirth.',
    radar: { epistemology: 7, nonDualism: 2, theism: 6, logic: 10, contemplation: 4, hermeneutics: 5 },
  },
  {
    id: 'vaisheshika',
    nodeId: 'darshana-vaisheshika',
    nameDevanagari: 'वैशेषिक',
    nameEnglish: 'Vaisheshika',
    founder: 'Sage Kanada (Ulūka)',
    founderNodeId: 'sage-kanada',
    rootText: 'Vaiśeṣika Sūtras',
    color: '#38BDF8', // Cyan
    pramanas: ['Pratyaksha (Perception)', 'Anumana (Inference)'],
    metaphysics: 'Atomic Pluralism (All physical reality composed of indestructible paramanus across 7 categories)',
    ishvaraConcept: 'Cosmic ordainer who combines atoms according to karmic adrishta',
    liberation: 'Moksha — Absolute cessation of pain when the soul realizes its distinctness from atomic matter',
    coreThesis: 'The universe consists of 7 Padarthas (substance, quality, action, generality, particularity, inherence, non-existence).',
    radar: { epistemology: 4, nonDualism: 1, theism: 5, logic: 8, contemplation: 3, hermeneutics: 3 },
  },
  {
    id: 'samkhya',
    nodeId: 'darshana-samkhya',
    nameDevanagari: 'सांख्य',
    nameEnglish: 'Samkhya',
    founder: 'Sage Kapila',
    founderNodeId: 'sage-kapila',
    rootText: 'Sāṃkhya Kārikā (Ishvarakrishna)',
    color: '#F472B6', // Rose
    pramanas: ['Pratyaksha (Perception)', 'Anumana (Inference)', 'Shabda (Testimony)'],
    metaphysics: 'Rigid Dualism between Purusha (Pure Consciousness) and Prakriti (Evolving Material Nature with 3 Gunas)',
    ishvaraConcept: 'Classically non-theistic (Nirīśvara); cosmic evolution happens spontaneously for Purusha\'s sight',
    liberation: 'Kaivalya — Complete isolation and independence of Purusha from the entanglement of Prakriti',
    coreThesis: 'Evolution of 24 material tattvas from unmanifest Mulaprakriti; suffering arises from confusing consciousness with nature.',
    radar: { epistemology: 6, nonDualism: 2, theism: 2, logic: 8, contemplation: 8, hermeneutics: 4 },
  },
  {
    id: 'yoga',
    nodeId: 'darshana-yoga-school',
    nameDevanagari: 'योग',
    nameEnglish: 'Yoga',
    founder: 'Sage Patanjali',
    founderNodeId: 'sage-patanjali',
    rootText: 'Yoga Sūtras of Patañjali',
    color: '#34D399', // Emerald
    pramanas: ['Pratyaksha (Perception)', 'Anumana (Inference)', 'Shabda (Testimony)'],
    metaphysics: 'Samkhya ontology enriched with an active spiritual methodology of mind-stilling',
    ishvaraConcept: 'Ishvara is a special Purusha untainted by karma or affliction; object of Ishvarapranidhana',
    liberation: 'Kaivalya — Resting of the Seer (Drashta) in its true, unperturbed, radiant nature',
    coreThesis: 'Yogaś citta-vṛtti-nirodhaḥ: Calming the fluctuations of the mind through the 8-limbed path leads to freedom.',
    radar: { epistemology: 6, nonDualism: 3, theism: 6, logic: 6, contemplation: 10, hermeneutics: 5 },
  },
  {
    id: 'mimamsa',
    nodeId: 'darshana-mimamsa',
    nameDevanagari: 'मीमांसा',
    nameEnglish: 'Purva Mimamsa',
    founder: 'Sage Jaimini',
    founderNodeId: 'sage-jaimini',
    rootText: 'Mīmāṃsā Sūtras',
    color: '#FBBF24', // Amber
    pramanas: ['Pratyaksha', 'Anumana', 'Upamana', 'Shabda', 'Arthapatti (Presumption)', 'Anupalabdhi (Non-perception)'],
    metaphysics: 'Eternal nature of sound (Shabda Nityatva) and Vedic injunctions; realism without a supreme personal creator',
    ishvaraConcept: 'Focuses on the impersonal Apurva (karmic efficacy) produced by Vedic Dharma rather than a creator God',
    liberation: 'Attainment of Svarga (heaven) through ritual duty, evolving to ultimate Moksha in later commentators (Kumarila)',
    coreThesis: 'Dharma is known exclusively through the eternal, uncreated Veda (Apaurusheya); linguistic hermeneutics is supreme.',
    radar: { epistemology: 10, nonDualism: 3, theism: 3, logic: 9, contemplation: 3, hermeneutics: 10 },
  },
  {
    id: 'vedanta',
    nodeId: 'darshana-advaita',
    nameDevanagari: 'उत्तर मीमांसा (वेदान्त)',
    nameEnglish: 'Vedanta',
    founder: 'Sage Badarayana (Codifier) & Adi Shankara',
    founderNodeId: 'sage-vyasa',
    rootText: 'Brahma Sūtras & Upanishads',
    color: '#FFD700', // Gold
    pramanas: ['Shabda (Primary for Brahman)', 'Pratyaksha', 'Anumana', 'Upamana', 'Arthapatti', 'Anupalabdhi'],
    metaphysics: 'Brahman is the non-dual supreme Reality (Advaita) / organic unity (Vishishtadvaita) / eternal distinctness (Dvaita)',
    ishvaraConcept: 'Saguna Brahman (Supreme Lord) in the empirical plane; Nirguna Brahman as ultimate reality in Advaita',
    liberation: 'Moksha / Jivanmukti — Realization of identity or communion between Atman and Brahman',
    coreThesis: 'Sarvaṃ khalv idaṃ brahma: The entire cosmos is grounded in Brahman; self-knowledge dissolves Maya.',
    radar: { epistemology: 9, nonDualism: 10, theism: 9, logic: 9, contemplation: 9, hermeneutics: 10 },
  },
];

const RADAR_AXES = [
  { key: 'epistemology', label: 'Epistemology (Pramanas)' },
  { key: 'nonDualism', label: 'Non-Dualism (Monism)' },
  { key: 'theism', label: 'Theistic Centrality' },
  { key: 'logic', label: 'Dialectical Rigor' },
  { key: 'contemplation', label: 'Yogic Realization' },
  { key: 'hermeneutics', label: 'Textual Authority' },
] as const;

export function DarshanaMatrix({ onSelectNode, selectedNode }: DarshanaMatrixProps) {
  const [activeSchools, setActiveSchools] = useState<Set<string>>(
    new Set(['nyaya', 'samkhya', 'yoga', 'vedanta'])
  );
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('vedanta');

  const toggleSchool = (id: string) => {
    setSelectedSchoolId(id);
    setActiveSchools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // Keep at least one
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedProfile = DARSHANAS.find((d) => d.id === selectedSchoolId) || DARSHANAS[5];

  // Radar geometry calculations
  const radarSize = 340;
  const center = radarSize / 2;
  const maxRadius = center - 45;
  const axisCount = RADAR_AXES.length;

  const getCoordinates = (axisIndex: number, value: number) => {
    const angle = (Math.PI * 2 / axisCount) * axisIndex - Math.PI / 2;
    const r = (value / 10) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="w-full h-full bg-[#050510] flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-14 border-b border-gray-800/80 bg-gray-950/80 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="font-devanagari text-lg text-yellow-400 font-bold">षड्दर्शन विचारः</span>
          <span className="text-xs text-gray-400 hidden md:inline">
            Comparative Matrix & Epistemological Radar of the 6 Orthodox Philosophical Systems
          </span>
        </div>

        {/* School Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {DARSHANAS.map((d) => {
            const isActive = activeSchools.has(d.id);
            return (
              <button
                key={d.id}
                onClick={() => toggleSchool(d.id)}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gray-800 text-white border-yellow-500/50 shadow-sm'
                    : 'bg-transparent text-gray-500 border-gray-800 hover:text-gray-300'
                }`}
                style={isActive ? { borderLeftColor: d.color, borderLeftWidth: 3 } : undefined}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.nameEnglish}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-28">
        {/* Left Side: Radar Chart & Epistemology Breakdown (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Radar Chart Card */}
          <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 backdrop-blur-md flex flex-col items-center shadow-xl">
            <div className="w-full flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-200">Philosophical Profile Radar</h3>
              <span className="text-[11px] text-gray-400">Multi-Axis Comparison</span>
            </div>

            {/* SVG Radar */}
            <svg width={radarSize} height={radarSize} className="overflow-visible my-2">
              {/* Concentric rings */}
              {[2, 4, 6, 8, 10].map((level) => {
                const points = RADAR_AXES.map((_, i) => {
                  const { x, y } = getCoordinates(i, level);
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis spokes */}
              {RADAR_AXES.map((axis, i) => {
                const { x, y } = getCoordinates(i, 10);
                const labelCoord = getCoordinates(i, 12);
                return (
                  <g key={axis.key}>
                    <line
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1"
                    />
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y}
                      fill="#9ca3af"
                      fontSize="9"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-medium"
                    >
                      {axis.label.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* School Polygons */}
              {DARSHANAS.filter((d) => activeSchools.has(d.id)).map((d) => {
                const points = RADAR_AXES.map((axis, i) => {
                  const val = d.radar[axis.key];
                  const { x, y } = getCoordinates(i, val);
                  return `${x},${y}`;
                }).join(' ');

                const isSelected = selectedSchoolId === d.id;

                return (
                  <polygon
                    key={d.id}
                    points={points}
                    fill={d.color}
                    fillOpacity={isSelected ? 0.35 : 0.12}
                    stroke={d.color}
                    strokeWidth={isSelected ? 2.8 : 1.6}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {DARSHANAS.filter((d) => activeSchools.has(d.id)).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedSchoolId(d.id)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-colors ${
                    selectedSchoolId === d.id
                      ? 'bg-gray-800 text-white font-bold border border-yellow-500/40'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span>{d.nameEnglish}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Epistemological Pramana Breakdown Card */}
          <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center justify-between">
              <span>Accepted Means of Knowledge (प्रमाणानि)</span>
              <span className="text-xs text-gray-400 font-normal">{selectedProfile.nameEnglish}</span>
            </h3>
            <div className="space-y-2">
              {selectedProfile.pramanas.map((pramana, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/60 border border-gray-800/80 text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  <span className="text-gray-200 font-medium">{pramana}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Comparative Card & Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Active School Focus Card */}
          <div
            className="p-6 rounded-2xl bg-gray-950/90 border border-gray-800 backdrop-blur-md shadow-2xl relative overflow-hidden"
            style={{ borderTop: `4px solid ${selectedProfile.color}` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-devanagari text-2xl text-yellow-400 font-bold">
                    {selectedProfile.nameDevanagari}
                  </span>
                  <span className="text-xl text-white font-semibold">{selectedProfile.nameEnglish}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Root Sage: <strong className="text-gray-200">{selectedProfile.founder}</strong> | Canonical Text:{' '}
                  <strong className="text-gray-200">{selectedProfile.rootText}</strong>
                </div>
              </div>

              {/* Action Buttons to open node in NodePanel */}
              <button
                onClick={() => {
                  const node = getNodeById(selectedProfile.nodeId);
                  if (node) onSelectNode(node);
                }}
                className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/40 text-yellow-300 text-xs font-medium transition-all"
              >
                Inspect in Panel →
              </button>
            </div>

            {/* Core Thesis Quote */}
            <div className="mt-4 p-3.5 rounded-xl bg-gray-900/80 border-l-4 border-yellow-500 text-sm text-gray-200 italic leading-relaxed">
              &ldquo;{selectedProfile.coreThesis}&rdquo;
            </div>

            {/* Grid of Key Tenets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800">
                <span className="text-[11px] uppercase tracking-wider text-yellow-500 font-bold">
                  Metaphysics & Ontology
                </span>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {selectedProfile.metaphysics}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800">
                <span className="text-[11px] uppercase tracking-wider text-yellow-500 font-bold">
                  Concept of Ishvara (Supreme)
                </span>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {selectedProfile.ishvaraConcept}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800 sm:col-span-2">
                <span className="text-[11px] uppercase tracking-wider text-yellow-500 font-bold">
                  Soteriology & Liberation (मोक्ष)
                </span>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {selectedProfile.liberation}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Comparison Cards for All 6 Schools */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
              All Orthodox Traditions At A Glance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DARSHANAS.map((d) => {
                const isSelected = selectedSchoolId === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedSchoolId(d.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gray-900 border-yellow-400 shadow-lg'
                        : 'bg-gray-950/60 hover:bg-gray-900/70 border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="font-devanagari text-sm font-semibold text-yellow-300">
                          {d.nameDevanagari}
                        </span>
                        <span className="text-xs font-medium text-white">{d.nameEnglish}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {d.pramanas.length} Pramāṇas
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {d.metaphysics}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
