import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyticsView } from './AnalyticsView';

describe('AnalyticsView Component', () => {
  test('renders analytics header and KPI cards', () => {
    render(<AnalyticsView onSelectNode={() => {}} />);

    expect(screen.getByText('ज्ञान साङ्ख्यिकी')).toBeInTheDocument();
    expect(screen.getByText('Total Nodes')).toBeInTheDocument();
    expect(screen.getAllByText('109').length).toBeGreaterThan(0);
    expect(screen.getByText('Total Edges')).toBeInTheDocument();
    expect(screen.getAllByText('411').length).toBeGreaterThan(0);
  });

  test('renders top knowledge hubs and allows clicking to select node', () => {
    const handleSelect = jest.fn();
    render(<AnalyticsView onSelectNode={handleSelect} />);

    expect(screen.getByText('Top Knowledge Hubs (Degree Centrality)')).toBeInTheDocument();

    // Find and click on Rigveda in top hubs
    const rigvedaElements = screen.getAllByText('Rigveda');
    fireEvent.click(rigvedaElements[0]);

    expect(handleSelect).toHaveBeenCalled();
  });

  test('renders domain composition and relationship typology', () => {
    render(<AnalyticsView onSelectNode={() => {}} />);

    expect(screen.getByText('Domain Composition')).toBeInTheDocument();
    expect(screen.getByText(/Relationship Typology/i)).toBeInTheDocument();
  });
});
