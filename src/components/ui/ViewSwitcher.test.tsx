import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewSwitcher, ViewMode } from './ViewSwitcher';

describe('ViewSwitcher Component', () => {
  test('renders all 6 visualization tabs', () => {
    const handleSelect = jest.fn();
    render(<ViewSwitcher currentView="cosmic" onSelectView={handleSelect} />);

    expect(screen.getByText('Cosmic 3D')).toBeInTheDocument();
    expect(screen.getByText('Veda Vriksha')).toBeInTheDocument();
    expect(screen.getByText('Shad-Darshana')).toBeInTheDocument();
    expect(screen.getByText('Chronology')).toBeInTheDocument();
    expect(screen.getByText('Radial Orbit')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  test('clicking a tab invokes onSelectView with correct ViewMode', () => {
    const handleSelect = jest.fn();
    render(<ViewSwitcher currentView="cosmic" onSelectView={handleSelect} />);

    fireEvent.click(screen.getByText('Veda Vriksha'));
    expect(handleSelect).toHaveBeenCalledWith('tree');

    fireEvent.click(screen.getByText('Shad-Darshana'));
    expect(handleSelect).toHaveBeenCalledWith('darshana');

    fireEvent.click(screen.getByText('Analytics'));
    expect(handleSelect).toHaveBeenCalledWith('analytics');
  });

  test('displays selected node indicator when provided', () => {
    const handleClear = jest.fn();
    render(
      <ViewSwitcher
        currentView="cosmic"
        onSelectView={() => {}}
        selectedNodeName="Rigveda"
        onClearSelectedNode={handleClear}
      />
    );

    expect(screen.getByText('Rigveda')).toBeInTheDocument();
    const closeBtn = screen.getByTitle('Deselect node');
    fireEvent.click(closeBtn);
    expect(handleClear).toHaveBeenCalled();
  });
});
