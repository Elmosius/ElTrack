import { isAllowedOrigin, isUnsafeMethod } from '#/lib/security/origin.server';
import type { H3Event } from 'nitro';

const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export default function securityMiddleware(event: H3Event) {
  for (const [name, value] of Object.entries(securityHeaders)) {
    event.res.headers.set(name, value);
  }

  if (process.env.NODE_ENV === 'production') {
    event.res.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }

  if (!isUnsafeMethod(event.req.method)) {
    return;
  }

  if (!isAllowedOrigin(event.req.headers.get('origin'))) {
    return new Response('Forbidden', { status: 403 });
  }
}
