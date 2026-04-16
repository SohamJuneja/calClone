import {
  cn,
  getDurationLabel,
  isValidSlug,
  slugify,
  generateTimeSlots,
  formatDate,
  formatTime,
} from '../utils';
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';

// ── cn (class merging) ─────────────────────────────────────────────────────
describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'no', true && 'yes')).toBe('base yes');
  });

  it('deduplicates tailwind classes', () => {
    // tailwind-merge should keep the last conflicting utility
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

// ── getDurationLabel ───────────────────────────────────────────────────────
describe('getDurationLabel()', () => {
  it('shows minutes for durations < 60', () => {
    expect(getDurationLabel(15)).toBe('15 min');
    expect(getDurationLabel(30)).toBe('30 min');
    expect(getDurationLabel(45)).toBe('45 min');
  });

  it('shows hours for exact multiples', () => {
    expect(getDurationLabel(60)).toBe('1 hr');
    expect(getDurationLabel(120)).toBe('2 hr');
  });

  it('shows hours and minutes for mixed durations', () => {
    expect(getDurationLabel(90)).toBe('1 hr 30 min');
    expect(getDurationLabel(75)).toBe('1 hr 15 min');
  });
});

// ── isValidSlug ────────────────────────────────────────────────────────────
describe('isValidSlug()', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('30min')).toBe(true);
    expect(isValidSlug('quick-chat')).toBe(true);
    expect(isValidSlug('meeting-123')).toBe(true);
  });

  it('rejects slugs with uppercase', () => {
    expect(isValidSlug('30Min')).toBe(false);
  });

  it('rejects slugs with spaces', () => {
    expect(isValidSlug('my meeting')).toBe(false);
  });

  it('rejects slugs with special characters', () => {
    expect(isValidSlug('meet!')).toBe(false);
    expect(isValidSlug('meet_now')).toBe(false);
  });
});

// ── slugify ────────────────────────────────────────────────────────────────
describe('slugify()', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('30 Minute Meeting')).toBe('30-minute-meeting');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple dashes', () => {
    expect(slugify('A  B  C')).toBe('a-b-c');
  });

  it('strips leading/trailing dashes', () => {
    expect(slugify(' hello ')).toBe('hello');
  });
});

// ── generateTimeSlots ──────────────────────────────────────────────────────
describe('generateTimeSlots()', () => {
  // Use a far-future date so "is past?" checks don't interfere
  const futureDate = addDays(new Date(), 30);
  const date = startOfDay(futureDate);

  const availability = [
    { dayOfWeek: date.getDay(), startTime: '09:00', endTime: '10:00', isAvailable: true },
  ];

  it('generates correct number of 30-min slots in a 1-hour window', () => {
    const slots = generateTimeSlots(date, availability, [], 30);
    // 9:00–9:30 and 9:30–10:00
    expect(slots).toHaveLength(2);
  });

  it('generates correct number of 15-min slots in a 1-hour window', () => {
    const slots = generateTimeSlots(date, availability, [], 15);
    // 9:00, 9:15, 9:30, 9:45
    expect(slots).toHaveLength(4);
  });

  it('returns empty array for unavailable day', () => {
    const blockedAvailability = [
      { dayOfWeek: date.getDay(), startTime: '09:00', endTime: '17:00', isAvailable: false },
    ];
    const slots = generateTimeSlots(date, blockedAvailability, [], 30);
    expect(slots).toHaveLength(0);
  });

  it('returns empty array when no availability matches the day', () => {
    // Set a different day-of-week so nothing matches
    const wrongDayAvailability = [
      { dayOfWeek: (date.getDay() + 1) % 7, startTime: '09:00', endTime: '17:00', isAvailable: true },
    ];
    const slots = generateTimeSlots(date, wrongDayAvailability, [], 30);
    expect(slots).toHaveLength(0);
  });

  it('marks booked slots as unavailable', () => {
    const bookedStart = setMinutes(setHours(date, 9), 0);
    const bookedEnd   = setMinutes(setHours(date, 9), 30);

    const bookings = [
      { startTime: bookedStart, endTime: bookedEnd, status: 'CONFIRMED' },
    ];

    const slots = generateTimeSlots(date, availability, bookings, 30);
    expect(slots).toHaveLength(2);
    expect(slots[0].available).toBe(false); // 9:00 is booked
    expect(slots[1].available).toBe(true);  // 9:30 is free
  });

  it('does not mark cancelled bookings as booked', () => {
    const bookedStart = setMinutes(setHours(date, 9), 0);
    const bookedEnd   = setMinutes(setHours(date, 9), 30);

    const bookings = [
      { startTime: bookedStart, endTime: bookedEnd, status: 'CANCELLED' },
    ];

    const slots = generateTimeSlots(date, availability, bookings, 30);
    expect(slots[0].available).toBe(true); // Cancelled → slot is free
  });

  it('slot labels are formatted correctly', () => {
    const slots = generateTimeSlots(date, availability, [], 60);
    expect(slots[0].label).toBe('9:00 AM');
  });
});

// ── formatDate / formatTime ────────────────────────────────────────────────
describe('formatDate()', () => {
  it('formats a date correctly', () => {
    const d = new Date(2026, 3, 20); // April 20, 2026
    expect(formatDate(d)).toBe('April 20, 2026');
  });
});

describe('formatTime()', () => {
  it('formats time correctly', () => {
    const d = new Date(2026, 3, 20, 14, 30); // 2:30 PM
    expect(formatTime(d)).toBe('2:30 PM');
  });
});
