/**
 * Reads a required environment variable.
 * Throws at startup if the variable is missing or empty,
 * so misconfigured deployments fail immediately with a clear message.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}
