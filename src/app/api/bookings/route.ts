import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
import { startOfDay, endOfDay, addMinutes } from 'date-fns';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, generateTimeSlots } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { z } from 'zod';

const createBookingSchema = z.object({
  eventTypeId: z.string().min(1),
  bookerName: z.string().min(1, 'Name is required').max(100),
  bookerEmail: z.string().email('Invalid email address'),
  startTime: z.string().datetime({ message: 'Invalid start time' }),
  notes: z.string().max(500).optional(),
});

// GET /api/bookings?status=upcoming|past|cancelled&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? 'upcoming';
    const page   = parseInt(searchParams.get('page') ?? '1', 10);
    const limit  = parseInt(searchParams.get('limit') ?? '20', 10);
    const skip   = (page - 1) * limit;
    const now    = new Date();

    let whereClause: Record<string, unknown> = {
      eventType: { userId: DEFAULT_USER_ID },
    };

    if (status === 'upcoming') {
      whereClause = { ...whereClause, status: 'CONFIRMED', startTime: { gte: now } };
    } else if (status === 'past') {
      whereClause = {
        ...whereClause,
        OR: [
          { status: 'COMPLETED' },
          { status: 'CONFIRMED', startTime: { lt: now } },
        ],
      };
    } else if (status === 'cancelled') {
      whereClause = { ...whereClause, status: 'CANCELLED' };
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where: whereClause as never }),
      prisma.booking.findMany({
        where: whereClause as never,
        include: {
          eventType: {
            select: { title: true, duration: true, color: true, slug: true },
          },
        },
        orderBy: { startTime: status === 'upcoming' ? 'asc' : 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return apiSuccess({ bookings, total, page, limit });
  } catch (err) {
    console.error('[GET /api/bookings]', err);
    return apiError('Failed to fetch bookings', 500);
  }
}

// POST /api/bookings – create a new booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 400);
    }

    const { eventTypeId, bookerName, bookerEmail, startTime: startTimeStr, notes } = parsed.data;

    // Fetch event type (validates it belongs to default user)
    const eventType = await prisma.eventType.findFirst({
      where: { id: eventTypeId, userId: DEFAULT_USER_ID, isActive: true },
    });
    if (!eventType) return apiError('Event type not found', 404);

    const startTime = new Date(startTimeStr);
    if (startTime < new Date()) {
      return apiError('Cannot book a time slot in the past', 400);
    }

    const endTime = addMinutes(startTime, eventType.duration);

    // Check availability for the day
    const dayOfWeek = startTime.getDay();
    const availability = await prisma.availability.findUnique({
      where: { userId_dayOfWeek: { userId: DEFAULT_USER_ID, dayOfWeek } },
    });

    if (!availability?.isAvailable) {
      return apiError('This day is not available for booking', 400);
    }

    // Check for conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        eventTypeId,
        status: 'CONFIRMED',
        OR: [
          // New booking overlaps an existing one
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    if (conflict) {
      return apiError('This time slot is already booked. Please choose another.', 409);
    }

    const booking = await prisma.booking.create({
      data: {
        eventTypeId,
        bookerName,
        bookerEmail,
        startTime,
        endTime,
        notes,
        status: 'CONFIRMED',
      },
      include: {
        eventType: {
          select: { title: true, duration: true, color: true },
        },
      },
    });

    return apiSuccess(booking, 201);
  } catch (err) {
    console.error('[POST /api/bookings]', err);
    return apiError('Failed to create booking', 500);
  }
}
