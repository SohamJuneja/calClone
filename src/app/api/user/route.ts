import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { apiSuccess, apiError } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';

// GET /api/user – fetch the default admin user profile
export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        avatar: true,
        timezone: true,
      },
    });

    if (!user) return apiError('User not found', 404);
    return apiSuccess(user);
  } catch (err) {
    console.error('[GET /api/user]', err);
    return apiError('Failed to fetch user', 500);
  }
}
