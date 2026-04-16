import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  addMinutes,
  setHours,
  setMinutes,
  isBefore,
  startOfDay,
} from 'date-fns';

// ── Tailwind class merging ─────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Time slot generation ───────────────────────────────────────────────────
export interface TimeSlot {
  time: Date;
  label: string;
  available: boolean;
}

export interface AvailabilityEntry {
  dayOfWeek: number;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  isAvailable: boolean;
}

export interface ExistingBooking {
  startTime: Date | string;
  endTime: Date | string;
  status: string;
}

/**
 * Generate available time slots for a given date.
 *
 * @param date           The date to generate slots for
 * @param availability   Weekly availability schedule
 * @param bookings       Existing confirmed bookings on that date
 * @param durationMins   Duration of the event type in minutes
 * @returns              Array of TimeSlot objects
 */
export function generateTimeSlots(
  date: Date,
  availability: AvailabilityEntry[],
  bookings: ExistingBooking[],
  durationMins: number,
): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const dayAvail = availability.find(
    (a) => a.dayOfWeek === dayOfWeek && a.isAvailable,
  );

  if (!dayAvail) return [];

  const [startH, startM] = dayAvail.startTime.split(':').map(Number);
  const [endH, endM] = dayAvail.endTime.split(':').map(Number);

  const dayStart = setMinutes(setHours(startOfDay(date), startH), startM);
  const dayEnd   = setMinutes(setHours(startOfDay(date), endH),   endM);
  const now      = new Date();

  const slots: TimeSlot[] = [];
  let cursor = dayStart;

  while (isBefore(addMinutes(cursor, durationMins), dayEnd) ||
         addMinutes(cursor, durationMins).getTime() === dayEnd.getTime()) {
    const slotEnd = addMinutes(cursor, durationMins);

    // Skip past slots
    if (isBefore(cursor, now)) {
      cursor = addMinutes(cursor, durationMins);
      continue;
    }

    const isBooked = bookings.some((b) => {
      if (b.status === 'CANCELLED') return false;
      const bStart = new Date(b.startTime);
      const bEnd   = new Date(b.endTime);
      // Overlap check: slot and booking overlap if they are not strictly non-overlapping
      return bStart < slotEnd && bEnd > cursor;
    });

    slots.push({
      time: new Date(cursor),
      label: format(cursor, 'h:mm a'),
      available: !isBooked,
    });

    cursor = addMinutes(cursor, durationMins);
  }

  return slots;
}

// ── Date/time helpers ──────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMMM d, yyyy');
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a');
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMMM d, yyyy · h:mm a');
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDayOfWeek(date: Date | string): string {
  return format(new Date(date), 'EEEE');
}

export function getDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

// ── Slug validation ────────────────────────────────────────────────────────
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── API response helpers ───────────────────────────────────────────────────
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
