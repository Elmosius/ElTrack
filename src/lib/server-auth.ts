import { auth } from '#/lib/auth.server';
import { getRequestHeaders } from '@tanstack/react-start/server';

export async function requireSessionUserId() {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user.id;
}
