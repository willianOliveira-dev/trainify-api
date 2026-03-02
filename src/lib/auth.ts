import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { env } from '@/config/env.js';
import { db } from '../db/connection.js';
import * as schema from '../db/schemas';

export const auth = betterAuth({
    trustedOrigins: env.allowedOrigins,
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [openAPI()],
});
