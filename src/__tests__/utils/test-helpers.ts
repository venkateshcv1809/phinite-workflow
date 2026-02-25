import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient;
let testDb: Db;

export const setupTestDatabase = async (): Promise<Db> => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    testDb = mongoClient.db();
  }
  return testDb;
};

export const cleanupTestDatabase = async (): Promise<void> => {
  if (testDb) {
    await testDb.dropDatabase();
  }
  if (mongoClient) {
    await mongoClient.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const clearTestCollections = async (): Promise<void> => {
  if (testDb) {
    const collections = await testDb.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
};

export const getTestDb = (): Db => {
  if (!testDb) {
    throw new Error(
      'Test database not initialized. Call setupTestDatabase() first.'
    );
  }
  return testDb;
};

// Mock JWT token generation
export const generateMockJWT = (payload: {
  id: string;
  email: string;
}): string => {
  return `mock-jwt-token-${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
};

// Mock Next.js cookies
export const createMockCookies = (token?: string) => {
  const cookies = new Map();
  if (token) {
    cookies.set('auth-token', { value: token });
  }
  return {
    get: (name: string) => cookies.get(name),
    set: (name: string, value: { value: string }) => cookies.set(name, value),
    delete: (name: string) => cookies.delete(name),
  };
};

// Wait for async operations
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Mock fetch for API testing
export const mockFetch = (response: unknown, ok = true, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  } as Response);
};

// Reset all mocks
export const resetAllMocks = (): void => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};
