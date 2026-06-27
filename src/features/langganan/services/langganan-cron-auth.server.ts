import '@tanstack/react-start/server-only';

export type CronAuthorizationResult =
  | { ok: true }
  | { ok: false; status: 401 | 500; message: string };

export function authorizeLanggananReminderCron(
  request: Request,
  secret = process.env.CRON_SECRET,
): CronAuthorizationResult {
  const normalizedSecret = secret?.trim();

  if (!normalizedSecret) {
    return {
      ok: false,
      status: 500,
      message: 'CRON_SECRET is not configured.',
    };
  }

  if (request.headers.get('authorization') !== `Bearer ${normalizedSecret}`) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized',
    };
  }

  return { ok: true };
}
