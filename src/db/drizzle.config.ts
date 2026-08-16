import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgres://${process.env.SQL_USER}:${encodeURIComponent(process.env.SQL_PASSWORD!)}@localhost/${process.env.SQL_DB_NAME}?host=${encodeURIComponent('/app/cloudsql/rising-run-nzp2g:europe-west2:ai-studio-b638989a')}`,
  },
});
