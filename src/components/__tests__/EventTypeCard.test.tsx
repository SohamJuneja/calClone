import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventTypeCard from '../event-types/EventTypeCard';

const mockEventType = {
  id: 'et-1',
  title: '30 Minute Meeting',
  slug: '30min',
  description: 'A quick 30-min chat.',
  duration: 30,
  color: '#6366f1',
  location: 'Google Meet',
  isActive: true,
  _count: { bookings: 5 },
};

const mockHandlers = {
  username: 'john',
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onCopyLink: jest.fn(),
};

describe('<EventTypeCard />', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders event title', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    expect(screen.getByText('30 Minute Meeting')).toBeInTheDocument();
  });

  it('renders duration', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('renders location', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    expect(screen.getByText('Google Meet')).toBeInTheDocument();
  });

  it('renders booking count', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    expect(screen.getByText('5 bookings')).toBeInTheDocument();
  });

  it('renders public URL slug', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    expect(screen.getByText('/john/30min')).toBeInTheDocument();
  });

  it('opens dropdown menu on click', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    const menuButton = screen.getByLabelText('Actions');
    fireEvent.click(menuButton);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
  });

  it('calls onEdit when Edit is clicked', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    fireEvent.click(screen.getByLabelText('Actions'));
    fireEvent.click(screen.getByText('Edit'));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockEventType);
  });

  it('calls onDelete when Delete is clicked', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    fireEvent.click(screen.getByLabelText('Actions'));
    fireEvent.click(screen.getByText('Delete'));
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('et-1');
  });

  it('calls onCopyLink when Copy link is clicked', () => {
    render(<EventTypeCard eventType={mockEventType} {...mockHandlers} />);
    fireEvent.click(screen.getByLabelText('Actions'));
    fireEvent.click(screen.getByText('Copy link'));
    expect(mockHandlers.onCopyLink).toHaveBeenCalledWith('30min');
  });

  it('renders singular "booking" for count of 1', () => {
    const et = { ...mockEventType, _count: { bookings: 1 } };
    render(<EventTypeCard eventType={et} {...mockHandlers} />);
    expect(screen.getByText('1 booking')).toBeInTheDocument();
  });

  it('renders 0 bookings', () => {
    const et = { ...mockEventType, _count: { bookings: 0 } };
    render(<EventTypeCard eventType={et} {...mockHandlers} />);
    expect(screen.getByText('0 bookings')).toBeInTheDocument();
  });
});
