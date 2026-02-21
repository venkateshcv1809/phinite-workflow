import 'server-only';
import { MongoClient } from 'mongodb';
import { CONFIG } from '../config';

const uri = CONFIG.MONGODB_URI!;
let clientPromise: Promise<MongoClient>;

if (CONFIG.IS_LOCAL) {
  // Preserve value across module reloads caused by HMR.
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
