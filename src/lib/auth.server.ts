import '@tanstack/react-start/server-only';

import { connectDB } from '#/db/mongoose.server';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

const mongoose = await connectDB();
const authMongoDatabase = mongoose.connection.db;
const authMongoClient = mongoose.connection.getClient();

export const auth = betterAuth({
  database: mongodbAdapter(authMongoDatabase, {
    client: authMongoClient,
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
