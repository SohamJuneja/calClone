import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { apiSuccess, apiError } from '@/lib/utils';

interface RouteContext {
  params: { username: string; slug: string };
}

// GET /api/public/:username/:slug – fetch public event type + user info
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { username, slug } = params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatar: true,
        timezone: true,
      },
    });

    if (!user) return apiError('User not found', 404);

    const eventType = await prisma.eventType.findFirst({
      where: { userId: user.id, slug, isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        duration: true,
        color: true,
        location: true,
      },
    });

    if (!eventType) return apiError('Event type not found', 404);

    return apiSuccess({ user, eventType });
  } catch (err) {
    console.error('[GET /api/public/:username/:slug]', err);
    return apiError('Failed to fetch event type', 500);
  }
}
