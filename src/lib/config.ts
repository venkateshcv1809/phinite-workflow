import { CONSTANTS } from './constants';

export const CONFIG = {
  IS_PRODUCTION: CONSTANTS.ENV === 'production',
  IS_LOCAL: CONSTANTS.ENV === 'local',
  MONGODB_URI:
    CONSTANTS.DB_METADATA.URI ||
    `mongodb://${CONSTANTS.DB_METADATA.USER}:${CONSTANTS.DB_METADATA.PASS}@${CONSTANTS.DB_METADATA.HOST}:${CONSTANTS.DB_METADATA.PORT}/${CONSTANTS.DB_METADATA.NAME}?authSource=admin`,

  DB_COLLECTIONS: {
    USERS: 'users',
    WORKFLOWS: 'workflows',
  },
  THEME: CONSTANTS.DARK_MODE ? 'dark' : 'light',
} as const;
