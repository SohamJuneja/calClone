import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingCard from '../bookings/BookingCard';
import { addDays, subDays, format } from 'date-fns';

const futureStart = addDays(new Date(), 5);
futureStart.setHours(10, 0, 0, 0);
const futureEnd = new Date(futureStart.getTime() + 30 * 60 * 1000);

const pastStart = subDays(new Date(), 5);
pastStart.setHours(10, 0, 0, 0);
const pastEnd = new Date(pastStart.getTime() + 30 * 60 * 1000);

const baseBooking = {
  id: 'booking-1',
  uid: 'uid-abc-123',
  bookerName: 'Alice Smith',
  bookerEmail: 'alice@example.com',
  startTime: futureStart.toISOString(),
  endTime: futureEnd.toISOString(),
  status: 'CONFIRMED' as const,
  notes: null,
  cancelReason: null,
  eventType: {
    title: '30 Minute Meeting',
    duration: 30,
    color: '#6366f1',
    slug: '30min',
  },
};

describe('<BookingCard />', () => {
  it('renders booker name', () => {
    render(<BookingCard booking={baseBooking} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('renders booker email', () => {
    render(<BookingCard booking={baseBooking} />);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders event type title', () => {
    render(<BookingCard booking={baseBooking} />);
    expect(screen.getByText('30 Minute Meeting')).toBeInTheDocument();
  });

  it('renders CONFIRMED badge', () => {
    render(<BookingCard booking={baseBooking} />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders CANCELLED badge and cancel reason', () => {
    const cancelled = {
      ...baseBooking,
      status: 'CANCELLED' as const,
      cancelReason: 'Schedule conflict',
    };
    render(<BookingCard booking={cancelled} />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Schedule conflict')).toBeInTheDocument();
  });

  it('renders notes when present', () => {
    const withNotes = { ...baseBooking, notes: 'Please prepare slides.' };
    render(<BookingCard booking={withNotes} />);
    expect(screen.getByText(/Please prepare slides/i)).toBeInTheDocument();
  });

  it('shows Cancel button for upcoming confirmed bookings', () => {
    const onCancel = jest.fn();
    render(<BookingCard booking={baseBooking} onCancel={onCancel} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<BookingCard booking={baseBooking} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledWith('booking-1');
  });

  it('does NOT show Cancel button for past bookings', () => {
    const past = {
      ...baseBooking,
      startTime: pastStart.toISOString(),
      endTime: pastEnd.toISOString(),
    };
    render(<BookingCard booking={past} onCancel={jest.fn()} />);
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('does NOT show Cancel button for cancelled bookings', () => {
    const cancelled = { ...baseBooking, status: 'CANCELLED' as const };
    render(<BookingCard booking={cancelled} onCancel={jest.fn()} />);
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
