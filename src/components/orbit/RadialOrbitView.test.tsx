import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadialOrbitView } from './RadialOrbitView';
import { getNodeById } from '@/data/repository';

describe('RadialOrbitView Component', () => {
  test('renders mandala orbit header and concentric rings', () => {
    const center = getNodeById('concept-brahman');
    render(<RadialOrbitView centerNode={center || null} onSelectNode={() => {}} />);

    expect(screen.getByText('मण्डल कक्ष्याः')).toBeInTheDocument();
    expect(screen.getByText(/Foundational Lineage/i)).toBeInTheDocument();
    expect(screen.getByText(/Intellectual Discourse/i)).toBeInTheDocument();
    expect(screen.getByText(/Thematic Resonance/i)).toBeInTheDocument();
  });

  test('selecting a different center node from dropdown triggers onSelectNode', () => {
    const handleSelect = jest.fn();
    render(<RadialOrbitView centerNode={null} onSelectNode={handleSelect} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'veda-rigveda' } });

    expect(handleSelect).toHaveBeenCalled();
  });
});
