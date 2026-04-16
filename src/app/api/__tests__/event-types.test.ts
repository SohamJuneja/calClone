/**
 * API Route tests for /api/event-types
 *
 * We mock Prisma to isolate business logic from the database.
 */

// ── Prisma mock ───────────────────────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    eventType: {
      findMany:  jest.fn(),
      findUnique: jest.fn(),
      findFirst:  jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
      delete:     jest.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';
import { GET, POST } from '../event-types/route';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(body?: unknown, method = 'GET'): Request {
  return new Request('http://localhost:3000/api/event-types', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── GET ───────────────────────────────────────────────────────────────────
describe('GET /api/event-types', () => {
  it('returns a list of event types', async () => {
    const mockData = [
      { id: 'et-1', title: '30 Minute Meeting', slug: '30min', duration: 30, _count: { bookings: 2 } },
    ];
    (mockPrisma.eventType.findMany as jest.Mock).mockResolvedValue(mockData);

    const res  = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe('30 Minute Meeting');
  });

  it('returns 500 on database error', async () => {
    (mockPrisma.eventType.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res  = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });
});

// ── POST ──────────────────────────────────────────────────────────────────
describe('POST /api/event-types', () => {
  it('creates an event type with valid data', async () => {
    const created = { id: 'et-new', title: 'Quick Chat', slug: 'quick-chat', duration: 15 };
    (mockPrisma.eventType.findUnique as jest.Mock).mockResolvedValue(null); // slug not taken
    (mockPrisma.eventType.create as jest.Mock).mockResolvedValue(created);

    const req  = makeRequest({ title: 'Quick Chat', slug: 'quick-chat', duration: 15, color: '#6366f1' }, 'POST');
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe('quick-chat');
  });

  it('returns 400 when title is missing', async () => {
    const req  = makeRequest({ slug: 'no-title', duration: 30 }, 'POST');
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 400 when slug contains invalid characters', async () => {
    const req  = makeRequest({ title: 'Test', slug: 'My Slug!', duration: 30 }, 'POST');
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 409 when slug is already taken', async () => {
    (mockPrisma.eventType.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

    const req  = makeRequest({ title: 'Meeting', slug: 'taken-slug', duration: 30 }, 'POST');
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });

  it('returns 400 for duration too short', async () => {
    const req  = makeRequest({ title: 'Short', slug: 'short', duration: 2 }, 'POST');
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
  });

  it('returns 400 for duration too long', async () => {
    const req  = makeRequest({ title: 'Long', slug: 'long', duration: 999 }, 'POST');
    const res  = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(400);
  });
});
