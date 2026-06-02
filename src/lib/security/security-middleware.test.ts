import { describe, expect, it } from 'vitest';
import securityMiddleware from '../../../server/middleware/security';

function createEvent(method = 'GET', origin?: string) {
  const requestHeaders = new Headers();

  if (origin) {
    requestHeaders.set('origin', origin);
  }

  return {
    req: {
      method,
      headers: requestHeaders,
    },
    res: {
      headers: new Headers(),
    },
  };
}

describe('securityMiddleware', () => {
  it('allows the configured Google Fonts sources in CSP', () => {
    const event = createEvent();

    securityMiddleware(event as never);

    const csp = event.res.headers.get('Content-Security-Policy') ?? '';

    expect(csp).toContain(
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    );
    expect(csp).toContain("font-src 'self' data: https://fonts.gstatic.com");
    expect(csp).toContain("object-src 'none'");
  });
});
