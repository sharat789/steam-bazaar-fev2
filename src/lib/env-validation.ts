/**
 * Environment variable validation for production builds
 * This ensures all required environment variables are present before the app starts
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_AGORA_APP_ID',
  'WEBSOCKET_URL',
] as const;

const requiredServerEnvVars = [
  'AGORA_APP_ID',
  'AGORA_APP_CERTIFICATE',
] as const;

export function validateClientEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\nPlease check your .env.local file.`
    );
  }
}

export function validateServerEnv() {
  const missing: string[] = [];

  // Check server-only env vars
  for (const envVar of requiredServerEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error(
      `Warning: Missing server environment variables:\n${missing.join('\n')}\n\nSome features may not work correctly.`
    );
  }
}
