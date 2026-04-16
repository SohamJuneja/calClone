export const DEFAULT_USER_ID = 'default-user-id';
export const DEFAULT_USERNAME = 'john';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

export const EVENT_COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Sky', value: '#0ea5e9' },
  { label: 'Green', value: '#10b981' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Pink', value: '#ec4899' },
] as const;

export const LOCATIONS = [
  'Google Meet',
  'Zoom',
  'Microsoft Teams',
  'Phone Call',
  'In Person',
  'Other',
] as const;

export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
