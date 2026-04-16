import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { z } from 'zod';

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

interface RouteContext {
  params: { id: string };
}

// POST /api/bookings/:id/cancel
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = cancelSchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;

    // Verify the booking belongs to an event type owned by our default user
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        eventType: { userId: DEFAULT_USER_ID },
      },
    });

    if (!booking) return apiError('Booking not found', 404);
    if (booking.status === 'CANCELLED') return apiError('Booking is already cancelled', 400);
    if (booking.startTime < new Date()) {
      return apiError('Cannot cancel a booking that has already passed', 400);
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED', cancelReason: reason ?? null },
      include: {
        eventType: { select: { title: true, duration: true } },
      },
    });

    return apiSuccess(updated);
  } catch (err) {
    console.error('[POST /api/bookings/:id/cancel]', err);
    return apiError('Failed to cancel booking', 500);
  }
}
