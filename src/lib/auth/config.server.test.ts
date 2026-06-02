import { describe, expect, it } from 'vitest';
import { resolveAuthRuntimeConfig } from './config.server';

const requiredEnv = {
  BETTER_AUTH_SECRET: 'test-secret',
};

describe('resolveAuthRuntimeConfig', () => {
  it('uses localhost in development when BETTER_AUTH_URL points to production', () => {
    const config = resolveAuthRuntimeConfig({
      ...requiredEnv,
      BETTER_AUTH_URL: 'https://eltrack.vercel.app',
      NODE_ENV: 'development',
    });

    expect(config.authBaseUrl).toBe('http://localhost:3000');
    expect(config.trustedOrigins).toEqual(['http://localhost:3000']);
  });

  it('allows a configured localhost URL in development', () => {
    const config = resolveAuthRuntimeConfig({
      ...requiredEnv,
      BETTER_AUTH_URL: 'http://localhost:5173',
      NODE_ENV: 'development',
    });

    expect(config.authBaseUrl).toBe('http://localhost:5173');
    expect(config.trustedOrigins).toEqual(['http://localhost:3000', 'http://localhost:5173']);
  });

  it('requires an HTTPS non-localhost BETTER_AUTH_URL in production', () => {
    expect(() =>
      resolveAuthRuntimeConfig({
        ...requiredEnv,
        BETTER_AUTH_URL: 'http://localhost:3000',
        NODE_ENV: 'production',
      }),
    ).toThrow('BETTER_AUTH_URL must use HTTPS in production');
  });
});
