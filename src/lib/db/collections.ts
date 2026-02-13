import 'server-only';
import _ from 'lodash';
import clientPromise from './mongodb';
import { CONSTANTS } from '../constants';

export const getDB = _.memoize(async () => {
  const client = await clientPromise;
  return client.db(CONSTANTS.DB_METADATA.NAME);
});
