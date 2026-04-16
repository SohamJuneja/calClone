import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from '../ui/Badge';

describe('<Badge />', () => {
  it('renders CONFIRMED status', () => {
    render(<Badge status="CONFIRMED" />);
    const badge = screen.getByText('Confirmed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-confirmed');
  });

  it('renders CANCELLED status', () => {
    render(<Badge status="CANCELLED" />);
    const badge = screen.getByText('Cancelled');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-cancelled');
  });

  it('renders COMPLETED status', () => {
    render(<Badge status="COMPLETED" />);
    const badge = screen.getByText('Completed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-completed');
  });

  it('applies additional className', () => {
    render(<Badge status="CONFIRMED" className="ml-2" />);
    expect(screen.getByText('Confirmed')).toHaveClass('ml-2');
  });
});
