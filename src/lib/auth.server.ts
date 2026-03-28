import '@tanstack/react-start/server-only';

import { getAuthMongoClient, getAuthMongoDatabase } from '#/db/auth-mongo.server';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

export const auth = betterAuth({
  database: mongodbAdapter(getAuthMongoDatabase(), {
    client: getAuthMongoClient(),
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      accessType: 'offline',
      prompt: 'select_account consent',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [tanstackStartCookies()],
});
