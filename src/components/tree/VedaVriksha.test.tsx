import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VedaVriksha } from './VedaVriksha';
import type { DomainId } from '@/types/knowledge';

const ALL_DOMAINS = new Set<DomainId>([
  'shruti', 'smriti', 'purana', 'vedanga',
  'upaveda', 'darshana', 'agama',
  'deity', 'sage', 'concept', 'science_art',
]);

describe('VedaVriksha Component', () => {
  test('renders tree header and main branches', () => {
    const handleSelect = jest.fn();
    render(
      <VedaVriksha
        onSelectNode={handleSelect}
        activeDomains={ALL_DOMAINS}
      />
    );

    expect(screen.getByText('वेदवृक्षः')).toBeInTheDocument();
    expect(screen.getByText('The Eternal Tree of Vedic Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Shruti (Revealed Canon)')).toBeInTheDocument();
    expect(screen.getByText('Vedangas (6 Auxiliary Limbs)')).toBeInTheDocument();
    expect(screen.getByText('Shad-Darshanas (6 Philosophical Schools)')).toBeInTheDocument();
  });

  test('clicking on a leaf node triggers onSelectNode', () => {
    const handleSelect = jest.fn();
    render(
      <VedaVriksha
        onSelectNode={handleSelect}
        activeDomains={ALL_DOMAINS}
      />
    );

    // Expand Shruti or click a visible node
    const shrutiBranch = screen.getByText('Rigveda Tradition');
    expect(shrutiBranch).toBeInTheDocument();
    fireEvent.click(shrutiBranch);

    expect(handleSelect).toHaveBeenCalled();
  });

  test('expand all and collapse all buttons function', () => {
    render(
      <VedaVriksha
        onSelectNode={() => {}}
        activeDomains={ALL_DOMAINS}
      />
    );

    const collapseBtn = screen.getByText('Collapse All');
    fireEvent.click(collapseBtn);

    const expandBtn = screen.getByText('Expand All');
    fireEvent.click(expandBtn);
  });
});
