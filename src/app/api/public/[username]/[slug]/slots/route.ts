import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
import { startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, generateTimeSlots } from '@/lib/utils';

interface RouteContext {
  params: { username: string; slug: string };
}

// GET /api/public/:username/:slug/slots?date=2026-04-20
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { username, slug } = params;
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) return apiError('date query param is required (YYYY-MM-DD)', 400);

    const date = parseISO(dateStr);
    if (!isValid(date)) return apiError('Invalid date format. Use YYYY-MM-DD', 400);

    // Don't serve slots for past dates
    if (startOfDay(date) < startOfDay(new Date())) {
      return apiSuccess([]);
    }

    // Resolve user + event type
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return apiError('User not found', 404);

    const eventType = await prisma.eventType.findFirst({
      where: { userId: user.id, slug, isActive: true },
    });
    if (!eventType) return apiError('Event type not found', 404);

    // Fetch availability schedule
    const availability = await prisma.availability.findMany({
      where: { userId: user.id },
    });

    // Check for date override
    const override = await prisma.dateOverride.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: startOfDay(date),
        },
      },
    });

    if (override?.isBlocked) {
      return apiSuccess([]);
    }

    // Build effective availability for this date
    let effectiveAvailability = availability;
    if (override?.startTime && override?.endTime) {
      const dayOfWeek = date.getDay();
      effectiveAvailability = availability.map((a) =>
        a.dayOfWeek === dayOfWeek
          ? { ...a, startTime: override.startTime!, endTime: override.endTime! }
          : a,
      );
    }

    // Fetch existing bookings for the day
    const existingBookings = await prisma.booking.findMany({
      where: {
        eventTypeId: eventType.id,
        status: 'CONFIRMED',
        startTime: { gte: startOfDay(date), lte: endOfDay(date) },
      },
      select: { startTime: true, endTime: true, status: true },
    });

    const slots = generateTimeSlots(
      date,
      effectiveAvailability,
      existingBookings,
      eventType.duration,
    );

    // Serialize dates as ISO strings for the client
    const serialized = slots.map((s) => ({
      time: s.time.toISOString(),
      label: s.label,
      available: s.available,
    }));

    return apiSuccess(serialized);
  } catch (err) {
    console.error('[GET /api/public/:username/:slug/slots]', err);
    return apiError('Failed to fetch time slots', 500);
  }
}
