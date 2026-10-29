import { defineConfig } from '@playwright/test'

export const localTestEnv = {
  NEXTAUTH_SECRET: 'synthetic-local-build-secret-not-real', NEXTAUTH_URL: 'http://127.0.0.1:3210',
  SUPABASE_URL: 'https://database.example.test', SUPABASE_SECRET_KEY: 'synthetic-build-key',
  GOOGLE_CLIENT_ID: 'synthetic-client', GOOGLE_CLIENT_SECRET: 'synthetic-secret',
  B2_APPLICATION_KEY_ID: 'synthetic-key-id', B2_APPLICATION_KEY: 'synthetic-key',
  B2_BUCKET_NAME: 'synthetic-bucket', B2_BUCKET_ID: 'synthetic-bucket-id',
  BLOB_READ_WRITE_TOKEN: 'synthetic-blob-token', ANTHROPIC_API_KEY: 'synthetic-ai-key',
  KV_REST_API_URL: 'https://kv.example.test', KV_REST_API_TOKEN: 'synthetic-kv-token',
  NEXT_TELEMETRY_DISABLED: '1',
}

export default defineConfig({
  testDir: './tests/browser',
  globalTimeout: 180_000,
  use: { baseURL: 'http://127.0.0.1:3210', headless: true },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3210',
    url: 'http://127.0.0.1:3210/sign-in', timeout: 60_000, reuseExistingServer: false,
    env: { ...process.env, ...localTestEnv },
  },
})
