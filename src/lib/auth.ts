import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { env } from '@/config/env';
import { db } from '../db/connection';
import * as schema from '../db/schemas';

export const auth = betterAuth({
    baseURL: env.betterAuthUrl,
    secret: env.betterAuthSecret,
    trustedOrigins: env.allowedOrigins,
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: env.googleClientId,
            clientSecret: env.googleClientSecret,
        },
    },
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: schema,
    }),
    plugins: [openAPI()],
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
            domain: env.nodeEnv === "production" ? ".onrender.com" : undefined
        }
    }
});

