import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env';

console.log(env.databaseUrl);
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.databaseUrl,
  },
});
