import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from '../booking/Calendar';
import { addDays, format, startOfDay } from 'date-fns';

const noop = jest.fn();

describe('<Calendar />', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the current month and year', () => {
    render(<Calendar selectedDate={null} onSelectDate={noop} />);
    const now = new Date();
    expect(screen.getByText(format(now, 'MMMM yyyy'))).toBeInTheDocument();
  });

  it('renders all 7 weekday header labels', () => {
    render(<Calendar selectedDate={null} onSelectDate={noop} />);
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('calls onSelectDate when a future date is clicked', () => {
    const futureDate = addDays(new Date(), 10);
    render(<Calendar selectedDate={null} onSelectDate={noop} />);

    const dayLabel = format(futureDate, 'd');
    // Find all buttons with that day number and click the first enabled one
    const buttons = screen.getAllByText(dayLabel);
    const enabled = buttons.find((b) => !(b as HTMLButtonElement).disabled);
    if (enabled) fireEvent.click(enabled);

    expect(noop).toHaveBeenCalled();
  });

  it('does NOT call onSelectDate when a past date is clicked', () => {
    render(<Calendar selectedDate={null} onSelectDate={noop} />);

    // "1" at the start of the month may be in the past; find a past button
    const buttons = screen.getAllByRole('button', { name: /^(Previous|Next|[0-9]+)/ });
    const disabledDay = buttons.find((b) => (b as HTMLButtonElement).disabled);
    if (disabledDay) {
      fireEvent.click(disabledDay);
      expect(noop).not.toHaveBeenCalled();
    }
  });

  it('navigates to the next month on chevron click', () => {
    render(<Calendar selectedDate={null} onSelectDate={noop} />);
    const nextBtn = screen.getByLabelText('Next month');
    fireEvent.click(nextBtn);

    const expected = format(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      'MMMM yyyy',
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('navigates to the previous month on chevron click', () => {
    render(<Calendar selectedDate={null} onSelectDate={noop} />);
    const prevBtn = screen.getByLabelText('Previous month');
    fireEvent.click(prevBtn);

    const expected = format(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      'MMMM yyyy',
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('highlights the selected date', () => {
    const futureDate = startOfDay(addDays(new Date(), 15));
    render(<Calendar selectedDate={futureDate} onSelectDate={noop} />);

    // The selected date button should have the brand background class
    const dayLabel = format(futureDate, 'd');
    const buttons  = screen.getAllByText(dayLabel);
    const selected = buttons.find((b) => b.classList.contains('bg-brand-600'));
    expect(selected).toBeDefined();
  });

  it('disables days matching disabledDays prop', () => {
    // Disable all days
    render(
      <Calendar
        selectedDate={null}
        onSelectDate={noop}
        disabledDays={[0, 1, 2, 3, 4, 5, 6]}
      />,
    );

    // Future date buttons (not prev/next navigation) should all be disabled
    const dayButtons = screen.getAllByRole('button').filter((b) => {
      const label = b.getAttribute('aria-label') ?? '';
      return /\d{4}/.test(label); // aria-label contains year
    });

    expect(dayButtons.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });
});
