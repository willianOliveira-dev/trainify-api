import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '../config/env';
import * as schema from './schemas';

export const db = drizzle(env.databaseUrl, { schema });
