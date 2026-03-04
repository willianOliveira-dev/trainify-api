import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { env } from '@/config/env.js';
import { db } from '../db/connection.js';
import * as schema from '../db/schemas';

export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,
  trustedOrigins: env.allowedOrigins,
  prompt: "select_account",
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  plugins: [openAPI()],
});
