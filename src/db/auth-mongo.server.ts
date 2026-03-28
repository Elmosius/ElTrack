import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

declare global {
  var __authMongoClient: MongoClient | undefined;
}

export function getAuthMongoClient() {
  if (!globalThis.__authMongoClient) {
    globalThis.__authMongoClient = new MongoClient(MONGODB_URI);
  }

  return globalThis.__authMongoClient;
}

export function getAuthMongoDatabase() {
  return getAuthMongoClient().db();
}
