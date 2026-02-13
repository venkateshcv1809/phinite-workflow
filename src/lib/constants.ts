export const getEnv = (key: string, required: boolean = false): string => {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`CRITICAL: Environment variable ${key} is missing.`);
  }
  return value || '';
};

export const CONSTANTS = {
  ENV: getEnv('NODE_ENV') || 'production',
  DB_METADATA: {
    NAME: getEnv('MONGODB_DB_NAME') || 'phinite',
    HOST: getEnv('MONGODB_HOST') || 'localhost',
    PORT: getEnv('MONGODB_PORT') || '27017',
    USER: getEnv('MONGODB_USERNAME'),
    PASS: getEnv('MONGODB_PASSWORD'),
    URI: getEnv('MONGODB_URI'),
  },
} as const;
