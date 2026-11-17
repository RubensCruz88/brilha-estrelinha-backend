import { defineConfig } from 'prisma/config';

// A CLI do Prisma não carrega o .env sozinha
try {
  process.loadEnvFile();
} catch {
  /* sem .env: usa as variáveis do ambiente */
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
