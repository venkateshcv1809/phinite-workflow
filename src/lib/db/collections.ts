import 'server-only';
import { memoize } from 'lodash';
import clientPromise from './mongodb';
import { CONSTANTS } from '../constants';
import { User } from './models/users';
import { CONFIG } from '../config';

const getDB = memoize(async () => {
  const client = await clientPromise;
  return client.db(CONSTANTS.DB_METADATA.NAME);
});

export const usersColl = async () => {
  const db = await getDB();
  return db.collection<User>(CONFIG.DB_COLLECTIONS.USERS);
};
