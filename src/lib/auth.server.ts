import '@tanstack/react-start/server-only';

import { connectDB } from '#/db/mongoose.server';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

const mongoose = await connectDB();
const authMongoDatabase = mongoose.connection.db;
const authMongoClient = mongoose.connection.getClient();
const localhostOrigin = 'http://localhost:3000';
const configuredBaseUrl = process.env.BETTER_AUTH_URL?.trim();
const authBaseUrl =
  process.env.NODE_ENV === 'development'
    ? localhostOrigin
    : configuredBaseUrl || localhostOrigin;
const trustedOrigins = Array.from(
  new Set(
    [localhostOrigin, configuredBaseUrl].filter(
      (origin): origin is string => Boolean(origin),
    ),
  ),
);

if (!authMongoDatabase) {
  throw new Error('Auth Mongo database is not available');
}

export const auth = betterAuth({
  database: mongodbAdapter(authMongoDatabase, {
    client: authMongoClient,
  }),
  baseURL: authBaseUrl,
  trustedOrigins,
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
