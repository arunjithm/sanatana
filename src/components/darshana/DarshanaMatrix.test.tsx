import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DarshanaMatrix } from './DarshanaMatrix';

describe('DarshanaMatrix Component', () => {
  test('renders header and all 6 orthodox schools', () => {
    const handleSelect = jest.fn();
    render(<DarshanaMatrix onSelectNode={handleSelect} />);

    expect(screen.getByText('षड्दर्शन विचारः')).toBeInTheDocument();
    expect(screen.getAllByText('Nyaya').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vaisheshika').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Samkhya').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Yoga').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Purva Mimamsa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vedanta').length).toBeGreaterThan(0);
  });

  test('renders radar chart and epistemology breakdown', () => {
    render(<DarshanaMatrix onSelectNode={() => {}} />);

    expect(screen.getByText('Philosophical Profile Radar')).toBeInTheDocument();
    expect(screen.getByText('Accepted Means of Knowledge (प्रमाणानि)')).toBeInTheDocument();
  });

  test('clicking on a school card switches the active school profile', () => {
    render(<DarshanaMatrix onSelectNode={() => {}} />);

    // Click on Yoga school card
    const yogaButtons = screen.getAllByText('Yoga');
    fireEvent.click(yogaButtons[0]);

    expect(screen.getByText(/Sage Patanjali/i)).toBeInTheDocument();
  });

  test('inspect in panel button calls onSelectNode', () => {
    const handleSelect = jest.fn();
    render(<DarshanaMatrix onSelectNode={handleSelect} />);

    const inspectBtn = screen.getByText('Inspect in Panel →');
    fireEvent.click(inspectBtn);

    expect(handleSelect).toHaveBeenCalled();
  });
});
