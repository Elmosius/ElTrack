const localhostOrigin = 'http://localhost:3000';

export type AuthEnvironment = Partial<
  Record<'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL' | 'NODE_ENV', string>
>;

function normalizeOrigin(value: string) {
  return new URL(value).origin;
}

function isLocalhostUrl(url: URL) {
  return (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '[::1]'
  );
}

function getConfiguredBaseUrl(env: AuthEnvironment) {
  const configuredBaseUrl = env.BETTER_AUTH_URL?.trim();

  if (!configuredBaseUrl) {
    return null;
  }

  try {
    return new URL(configuredBaseUrl);
  } catch {
    throw new Error('BETTER_AUTH_URL must be a valid URL');
  }
}

export function resolveAuthRuntimeConfig(env: AuthEnvironment = process.env) {
  const authSecret = env.BETTER_AUTH_SECRET?.trim();

  if (!authSecret) {
    throw new Error('BETTER_AUTH_SECRET is required');
  }

  const configuredBaseUrl = getConfiguredBaseUrl(env);
  const isProduction = env.NODE_ENV === 'production';

  if (isProduction) {
    if (!configuredBaseUrl) {
      throw new Error('BETTER_AUTH_URL is required in production');
    }

    if (configuredBaseUrl.protocol !== 'https:') {
      throw new Error('BETTER_AUTH_URL must use HTTPS in production');
    }

    if (isLocalhostUrl(configuredBaseUrl)) {
      throw new Error('BETTER_AUTH_URL cannot point to localhost in production');
    }

    const authBaseUrl = normalizeOrigin(configuredBaseUrl.href);

    return {
      authBaseUrl,
      authSecret,
      trustedOrigins: [authBaseUrl],
    };
  }

  const configuredOrigin =
    configuredBaseUrl && isLocalhostUrl(configuredBaseUrl)
      ? normalizeOrigin(configuredBaseUrl.href)
      : null;

  return {
    authBaseUrl: configuredOrigin ?? localhostOrigin,
    authSecret,
    trustedOrigins: Array.from(
      new Set([localhostOrigin, configuredOrigin].filter(Boolean)),
    ) as string[],
  };
}
