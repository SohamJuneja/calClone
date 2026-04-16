import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { apiSuccess, apiError } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().max(500).optional().nullable(),
  duration: z.number().int().min(5).max(480).optional(),
  color: z.string().optional(),
  location: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

interface RouteContext {
  params: { id: string };
}

// GET /api/event-types/:id
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const eventType = await prisma.eventType.findFirst({
      where: { id: params.id, userId: DEFAULT_USER_ID },
    });

    if (!eventType) return apiError('Event type not found', 404);
    return apiSuccess(eventType);
  } catch (err) {
    console.error('[GET /api/event-types/:id]', err);
    return apiError('Failed to fetch event type', 500);
  }
}

// PATCH /api/event-types/:id
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 400);
    }

    const existing = await prisma.eventType.findFirst({
      where: { id: params.id, userId: DEFAULT_USER_ID },
    });
    if (!existing) return apiError('Event type not found', 404);

    // If slug is being changed, check uniqueness
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugTaken = await prisma.eventType.findUnique({
        where: { userId_slug: { userId: DEFAULT_USER_ID, slug: parsed.data.slug } },
      });
      if (slugTaken) return apiError('This URL slug is already taken.', 409);
    }

    const updated = await prisma.eventType.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return apiSuccess(updated);
  } catch (err) {
    console.error('[PATCH /api/event-types/:id]', err);
    return apiError('Failed to update event type', 500);
  }
}

// DELETE /api/event-types/:id
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const existing = await prisma.eventType.findFirst({
      where: { id: params.id, userId: DEFAULT_USER_ID },
    });
    if (!existing) return apiError('Event type not found', 404);

    await prisma.eventType.delete({ where: { id: params.id } });
    return apiSuccess({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/event-types/:id]', err);
    return apiError('Failed to delete event type', 500);
  }
}
