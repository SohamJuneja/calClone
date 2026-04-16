import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { apiSuccess, apiError } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const availabilityDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Time must be in HH:MM format'),
  endTime: z.string().regex(timeRegex, 'Time must be in HH:MM format'),
  isAvailable: z.boolean(),
});

const updateSchema = z.object({
  timezone: z.string().optional(),
  days: z.array(availabilityDaySchema),
});

// GET /api/availability
export async function GET() {
  try {
    const [user, availability] = await Promise.all([
      prisma.user.findUnique({ where: { id: DEFAULT_USER_ID }, select: { timezone: true } }),
      prisma.availability.findMany({
        where: { userId: DEFAULT_USER_ID },
        orderBy: { dayOfWeek: 'asc' },
      }),
    ]);

    return apiSuccess({ timezone: user?.timezone ?? 'UTC', days: availability });
  } catch (err) {
    console.error('[GET /api/availability]', err);
    return apiError('Failed to fetch availability', 500);
  }
}

// PUT /api/availability – replace full schedule
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 400);
    }

    const { timezone, days } = parsed.data;

    // Validate end > start for available days
    for (const day of days) {
      if (day.isAvailable && day.startTime >= day.endTime) {
        return apiError(
          `End time must be after start time for day ${day.dayOfWeek}`,
          400,
        );
      }
    }

    // Use a transaction to atomically replace availability
    await prisma.$transaction(async (tx) => {
      if (timezone) {
        await tx.user.update({
          where: { id: DEFAULT_USER_ID },
          data: { timezone },
        });
      }

      for (const day of days) {
        await tx.availability.upsert({
          where: { userId_dayOfWeek: { userId: DEFAULT_USER_ID, dayOfWeek: day.dayOfWeek } },
          update: {
            startTime: day.startTime,
            endTime: day.endTime,
            isAvailable: day.isAvailable,
          },
          create: {
            userId: DEFAULT_USER_ID,
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
            isAvailable: day.isAvailable,
          },
        });
      }
    });

    // Return updated data
    const [user, availability] = await Promise.all([
      prisma.user.findUnique({ where: { id: DEFAULT_USER_ID }, select: { timezone: true } }),
      prisma.availability.findMany({
        where: { userId: DEFAULT_USER_ID },
        orderBy: { dayOfWeek: 'asc' },
      }),
    ]);

    return apiSuccess({ timezone: user?.timezone ?? 'UTC', days: availability });
  } catch (err) {
    console.error('[PUT /api/availability]', err);
    return apiError('Failed to update availability', 500);
  }
}
