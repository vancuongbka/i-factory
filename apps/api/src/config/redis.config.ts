import { registerAs } from '@nestjs/config';
import { requireEnv } from './env';

export default registerAs('redis', () => {
  const url = process.env.REDIS_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379', 10),
      password: parsed.password || undefined,
    };
  }
  return {
    host: requireEnv('REDIS_HOST'),
    port: parseInt(requireEnv('REDIS_PORT'), 10),
    password: process.env.REDIS_PASSWORD || undefined,
  };
});
