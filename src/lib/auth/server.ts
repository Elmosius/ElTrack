import '@tanstack/react-start/server-only';

import { connectDB } from '#/db/mongoose.server';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { resolveAuthRuntimeConfig } from './config.server';

const mongoose = await connectDB();
const authMongoDatabase = mongoose.connection.db;
const authMongoClient = mongoose.connection.getClient();
const { authBaseUrl, authSecret, trustedOrigins } = resolveAuthRuntimeConfig();

if (!authMongoDatabase) {
  throw new Error('Auth Mongo database is not available');
}

export const auth = betterAuth({
  database: mongodbAdapter(authMongoDatabase, {
    client: authMongoClient,
  }),
  baseURL: authBaseUrl,
  secret: authSecret,
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
