/**
 * API Route tests for /api/bookings
 */

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    booking: {
      findMany:  jest.fn(),
      findFirst: jest.fn(),
      create:    jest.fn(),
      update:    jest.fn(),
      count:     jest.fn(),
    },
    eventType: {
      findFirst: jest.fn(),
    },
    availability: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';
import { GET, POST } from '../bookings/route';
import { addDays, addMinutes } from 'date-fns';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(body?: unknown, method = 'POST', url = 'http://localhost:3000/api/bookings'): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const futureDate = addDays(new Date(), 5);
futureDate.setHours(10, 0, 0, 0);

const mockEventType = {
  id: 'et-1',
  userId: 'default-user-id',
  title: '30 Minute Meeting',
  duration: 30,
  isActive: true,
};

const mockAvailability = {
  dayOfWeek: futureDate.getDay(),
  startTime: '09:00',
  endTime: '17:00',
  isAvailable: true,
};

// ── GET ───────────────────────────────────────────────────────────────────
describe('GET /api/bookings', () => {
  it('returns upcoming bookings by default', async () => {
    const mockBookings = [
      {
        id: 'b-1',
        bookerName: 'Alice',
        startTime: futureDate,
        status: 'CONFIRMED',
        eventType: { title: '30 Min', duration: 30, color: '#6366f1', slug: '30min' },
      },
    ];

    (mockPrisma.booking.count as jest.Mock).mockResolvedValue(1);
    (mockPrisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

    const req  = makeRequest(undefined, 'GET', 'http://localhost:3000/api/bookings?status=upcoming');
    const res  = await GET(req as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.bookings).toHaveLength(1);
  });
});

// ── POST ──────────────────────────────────────────────────────────────────
describe('POST /api/bookings', () => {
  beforeEach(() => {
    (mockPrisma.eventType.findFirst as jest.Mock).mockResolvedValue(mockEventType);
    (mockPrisma.availability.findUnique as jest.Mock).mockResolvedValue(mockAvailability);
    (mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null); // no conflicts
    (mockPrisma.booking.create as jest.Mock).mockResolvedValue({
      id: 'b-new',
      uid: 'uid-new',
      bookerName: 'Bob',
      bookerEmail: 'bob@example.com',
      startTime: futureDate,
      endTime: addMinutes(futureDate, 30),
      status: 'CONFIRMED',
      eventType: mockEventType,
    });
  });

  it('creates a booking with valid data', async () => {
    const req  = makeRequest({
      eventTypeId: 'et-1',
      bookerName: 'Bob Jones',
      bookerEmail: 'bob@example.com',
      startTime: futureDate.toISOString(),
    });
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it('returns 400 when name is missing', async () => {
    const req  = makeRequest({
      eventTypeId: 'et-1',
      bookerEmail: 'bob@example.com',
      startTime: futureDate.toISOString(),
    });
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 400 for invalid email', async () => {
    const req  = makeRequest({
      eventTypeId: 'et-1',
      bookerName: 'Bob',
      bookerEmail: 'not-an-email',
      startTime: futureDate.toISOString(),
    });
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
  });

  it('returns 400 for past start time', async () => {
    const pastDate = new Date(2020, 1, 1, 10, 0);
    const req  = makeRequest({
      eventTypeId: 'et-1',
      bookerName: 'Bob',
      bookerEmail: 'bob@example.com',
      startTime: pastDate.toISOString(),
    });
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/past/i);
  });

  it('returns 404 when event type not found', async () => {
    (mockPrisma.eventType.findFirst as jest.Mock).mockResolvedValue(null);

    const req  = makeRequest({
      eventTypeId: 'nonexistent',
      bookerName: 'Bob',
      bookerEmail: 'bob@example.com',
      startTime: futureDate.toISOString(),
    });
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(404);
  });

  it('returns 409 when slot is already booked', async () => {
    (mockPrisma.booking.findFirst as jest.Mock).mockResolvedValue({ id: 'conflict' });

    const req  = makeRequest({
      eventTypeId: 'et-1',
      bookerName: 'Bob',
      bookerEmail: 'bob@example.com',
      startTime: futureDate.toISOString(),
    });
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toMatch(/already booked/i);
  });

  it('returns 400 when day is not available', async () => {
    (mockPrisma.availability.findUnique as jest.Mock).mockResolvedValue({
      ...mockAvailability,
      isAvailable: false,
    });

    const req  = makeRequest({
      eventTypeId: 'et-1',
      bookerName: 'Bob',
      bookerEmail: 'bob@example.com',
      startTime: futureDate.toISOString(),
    });
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/not available/i);
  });
});
