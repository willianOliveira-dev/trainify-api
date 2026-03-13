import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    port: z.coerce.number().default(3000),
    nodeEnv: z.enum(['development', 'production']).default('development'),
    databaseUrl: z.string().startsWith('postgresql://'),
    baseUrl: z.string().default('http://localhost:8000'),
    logLevel: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
        .default('info'),
    allowedOrigins: z
        .string()
        .default('http://localhost:3000')
        .transform((val) => val.split(',').map((origin) => origin.trim())),
    youtubeApiKey: z.string(),
    googleClientId: z.string(),
    googleClientSecret: z.string(),
    betterAuthSecret: z.string(),
    betterAuthUrl: z.string(),
    apiVersion: z.string().default('1.0.0'),
    host: z.string().default('0.0.0.0'),
});

export const env = envSchema.parse({
    port: process.env.PORT,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    databaseUrl: process.env.DATABASE_URL,
    youtubeApiKey: process.env.YOUTUBE_API_KEY,
    baseUrl: process.env.BASE_URL,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    apiVersion: process.env.API_VERSION,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    host: process.env.HOST,
});
