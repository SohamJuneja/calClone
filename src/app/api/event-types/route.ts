import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, isValidSlug } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(5).max(480),
  color: z.string().default('#6366f1'),
  location: z.string().optional(),
});

// GET /api/event-types – list all event types for the default user
export async function GET() {
  try {
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
    });

    return apiSuccess(eventTypes);
  } catch (err) {
    console.error('[GET /api/event-types]', err);
    return apiError('Failed to fetch event types', 500);
  }
}

// POST /api/event-types – create a new event type
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 400);
    }

    const { title, slug, description, duration, color, location } = parsed.data;

    // Check slug uniqueness
    const existing = await prisma.eventType.findUnique({
      where: { userId_slug: { userId: DEFAULT_USER_ID, slug } },
    });
    if (existing) {
      return apiError('This URL slug is already taken. Please choose another.', 409);
    }

    const eventType = await prisma.eventType.create({
      data: {
        userId: DEFAULT_USER_ID,
        title,
        slug,
        description,
        duration,
        color,
        location,
      },
    });

    return apiSuccess(eventType, 201);
  } catch (err) {
    console.error('[POST /api/event-types]', err);
    return apiError('Failed to create event type', 500);
  }
}
