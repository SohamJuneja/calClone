import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeSlots from '../booking/TimeSlots';
import { addDays } from 'date-fns';

const futureDate = addDays(new Date(), 10);

const sampleSlots = [
  { time: new Date(futureDate.setHours(9, 0, 0, 0)).toISOString(), label: '9:00 AM', available: true },
  { time: new Date(futureDate.setHours(9, 30, 0, 0)).toISOString(), label: '9:30 AM', available: true },
  { time: new Date(futureDate.setHours(10, 0, 0, 0)).toISOString(), label: '10:00 AM', available: false },
];

const noop = jest.fn();

describe('<TimeSlots />', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows a spinner while loading', () => {
    const { container } = render(
      <TimeSlots
        date={futureDate}
        slots={[]}
        loading={true}
        selectedSlot={null}
        onSelectSlot={noop}
      />,
    );
    // LoadingSpinner renders an SVG with animate-spin
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty message when no available slots', () => {
    render(
      <TimeSlots
        date={futureDate}
        slots={[]}
        loading={false}
        selectedSlot={null}
        onSelectSlot={noop}
      />,
    );
    expect(screen.getByText(/No available slots/i)).toBeInTheDocument();
  });

  it('renders only available slots', () => {
    render(
      <TimeSlots
        date={futureDate}
        slots={sampleSlots}
        loading={false}
        selectedSlot={null}
        onSelectSlot={noop}
      />,
    );
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('9:30 AM')).toBeInTheDocument();
    // 10:00 AM is not available, should not render
    expect(screen.queryByText('10:00 AM')).not.toBeInTheDocument();
  });

  it('calls onSelectSlot when a slot is clicked', () => {
    render(
      <TimeSlots
        date={futureDate}
        slots={sampleSlots}
        loading={false}
        selectedSlot={null}
        onSelectSlot={noop}
      />,
    );
    fireEvent.click(screen.getByText('9:00 AM'));
    expect(noop).toHaveBeenCalledWith(sampleSlots[0]);
  });

  it('highlights the selected slot', () => {
    render(
      <TimeSlots
        date={futureDate}
        slots={sampleSlots}
        loading={false}
        selectedSlot={sampleSlots[0].time}
        onSelectSlot={noop}
      />,
    );
    const selectedBtn = screen.getByText('9:00 AM').closest('button');
    expect(selectedBtn).toHaveClass('bg-brand-600');
  });
});
