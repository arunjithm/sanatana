import React from 'react';
import { render, screen } from '@testing-library/react';
import { NodePanel } from '@/components/panel/NodePanel';
import { KnowledgeNode } from '@/types/knowledge';

// Mock the repository so we don't need data files loaded
jest.mock('@/data/repository', () => ({
  getEdgesForNode: () => [],
  getNodeById: () => null,
}));

const baseNode: KnowledgeNode = {
  id: 'test-node',
  slug: 'test-node',
  nameDevanagari: 'परीक्षा',
  nameTransliteration: 'Parīkṣā',
  nameEnglish: 'Test Node',
  meaningEnglish: 'A test',
  domain: 'concept',
  category: 'test',
  tier: 'planet',
  historicalContext: 'Some context',
  explanation: 'Some explanation',
  sources: [{ text: 'Test Source' }],
  confidence: 'established',
};

test('renders without crash when sanskritPassages is undefined', () => {
  const node = { ...baseNode, sanskritPassages: undefined };
  render(<NodePanel node={node} onClose={() => {}} onNavigateTo={() => {}} />);
  expect(screen.getByText('Test Node')).toBeInTheDocument();
  // No Sanskrit Passages section should appear
  expect(screen.queryByText(/Sanskrit Passages/i)).not.toBeInTheDocument();
});

test('renders without crash when sanskritPassages is empty array', () => {
  const node = { ...baseNode, sanskritPassages: [] };
  render(<NodePanel node={node} onClose={() => {}} onNavigateTo={() => {}} />);
  expect(screen.getByText('Test Node')).toBeInTheDocument();
  expect(screen.queryByText(/Sanskrit Passages/i)).not.toBeInTheDocument();
});

test('does not render Scholarly Notes when scholarlyNotes is absent', () => {
  render(<NodePanel node={baseNode} onClose={() => {}} onNavigateTo={() => {}} />);
  expect(screen.queryByText(/Scholarly Notes/i)).not.toBeInTheDocument();
});
