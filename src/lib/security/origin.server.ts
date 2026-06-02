import { resolveAuthRuntimeConfig } from '#/lib/auth/config.server';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function isUnsafeMethod(method: string) {
  return unsafeMethods.has(method.toUpperCase());
}

export function isAllowedOrigin(
  origin: string | null,
  env: NodeJS.ProcessEnv = process.env,
) {
  if (!origin) {
    return true;
  }

  try {
    const normalizedOrigin = new URL(origin).origin;
    const { trustedOrigins } = resolveAuthRuntimeConfig(env);

    return trustedOrigins.includes(normalizedOrigin);
  } catch {
    return false;
  }
}
