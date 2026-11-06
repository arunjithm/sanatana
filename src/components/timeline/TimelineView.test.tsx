import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineView } from './TimelineView';
import type { DomainId } from '@/types/knowledge';

const ALL_DOMAINS = new Set<DomainId>([
  'shruti', 'smriti', 'purana', 'vedanga',
  'upaveda', 'darshana', 'agama',
  'deity', 'sage', 'concept', 'science_art',
]);

describe('TimelineView Component', () => {
  test('renders timeline header and eras', () => {
    render(<TimelineView onSelectNode={() => {}} activeDomains={ALL_DOMAINS} />);

    expect(screen.getByText('कालक्रम प्रवाहः')).toBeInTheDocument();
    expect(screen.getByText('Early Vedic Dawn')).toBeInTheDocument();
    expect(screen.getByText('Upanishadic Axial Age')).toBeInTheDocument();
    expect(screen.getByText('Scholastic Acharya Renaissance')).toBeInTheDocument();
  });

  test('clicking on node button in timeline calls onSelectNode', () => {
    const handleSelect = jest.fn();
    render(<TimelineView onSelectNode={handleSelect} activeDomains={ALL_DOMAINS} />);

    // Click on Rigveda button in Early Vedic era
    const rigvedaBtns = screen.getAllByText('Rigveda');
    fireEvent.click(rigvedaBtns[0]);

    expect(handleSelect).toHaveBeenCalled();
  });

  test('filtering by specific era updates view', () => {
    render(<TimelineView onSelectNode={() => {}} activeDomains={ALL_DOMAINS} />);

    const upanishadFilterBtn = screen.getByText('Upanishadic');
    fireEvent.click(upanishadFilterBtn);

    expect(screen.getByText('Upanishadic Axial Age')).toBeInTheDocument();
  });
});
