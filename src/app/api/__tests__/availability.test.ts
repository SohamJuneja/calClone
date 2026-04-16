/**
 * API Route tests for /api/availability
 */

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    availability: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import prisma from '@/lib/prisma';
import { GET, PUT } from '../availability/route';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(body?: unknown, method = 'GET'): Request {
  return new Request('http://localhost:3000/api/availability', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const mockDays = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false },
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true  },
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true  },
];

// ── GET ───────────────────────────────────────────────────────────────────
describe('GET /api/availability', () => {
  it('returns availability data', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ timezone: 'America/New_York' });
    (mockPrisma.availability.findMany as jest.Mock).mockResolvedValue(mockDays);

    const res  = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.timezone).toBe('America/New_York');
    expect(body.data.days).toHaveLength(3);
  });

  it('returns UTC as default timezone when user not found', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.availability.findMany as jest.Mock).mockResolvedValue([]);

    const res  = await GET();
    const body = await res.json();

    expect(body.data.timezone).toBe('UTC');
  });
});

// ── PUT ───────────────────────────────────────────────────────────────────
describe('PUT /api/availability', () => {
  beforeEach(() => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      // Call fn with a mock transaction object
      await fn({
        user: { update: jest.fn() },
        availability: { upsert: jest.fn() },
      });
    });
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ timezone: 'America/New_York' });
    (mockPrisma.availability.findMany as jest.Mock).mockResolvedValue(mockDays);
  });

  it('saves valid availability', async () => {
    const req  = makeRequest({ timezone: 'UTC', days: mockDays }, 'PUT');
    const res  = await PUT(req as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 400 when end time is before start time for an available day', async () => {
    const badDays = [
      { dayOfWeek: 1, startTime: '17:00', endTime: '09:00', isAvailable: true },
    ];
    const req  = makeRequest({ days: badDays }, 'PUT');
    const res  = await PUT(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 400 when time format is invalid', async () => {
    const badDays = [
      { dayOfWeek: 1, startTime: '9am', endTime: '5pm', isAvailable: true },
    ];
    const req  = makeRequest({ days: badDays }, 'PUT');
    const res  = await PUT(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
  });

  it('accepts disabled days with equal start/end times (not validated)', async () => {
    const disabledDays = [
      { dayOfWeek: 0, startTime: '09:00', endTime: '09:00', isAvailable: false },
    ];
    const req  = makeRequest({ days: disabledDays }, 'PUT');
    const res  = await PUT(req as never);
    const body = await res.json();

    // Should succeed since the day is not available (no validation needed)
    expect(res.status).toBe(200);
  });
});
