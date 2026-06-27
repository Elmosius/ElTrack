import { describe, expect, it } from 'vitest';
import { authorizeLanggananReminderCron } from './langganan-cron-auth.server';

describe('langganan cron auth', () => {
  it('rejects requests when CRON_SECRET is missing', () => {
    const request = new Request('https://eltrack.test/api/cron/langganan-push-reminders');

    expect(authorizeLanggananReminderCron(request, '')).toEqual({
      ok: false,
      status: 500,
      message: 'CRON_SECRET is not configured.',
    });
  });

  it('rejects requests with the wrong bearer token', () => {
    const request = new Request('https://eltrack.test/api/cron/langganan-push-reminders', {
      headers: {
        authorization: 'Bearer wrong',
      },
    });

    expect(authorizeLanggananReminderCron(request, 'secret')).toEqual({
      ok: false,
      status: 401,
      message: 'Unauthorized',
    });
  });

  it('allows requests with the configured bearer token', () => {
    const request = new Request('https://eltrack.test/api/cron/langganan-push-reminders', {
      headers: {
        authorization: 'Bearer secret',
      },
    });

    expect(authorizeLanggananReminderCron(request, 'secret')).toEqual({ ok: true });
  });
});
