import dotenv from 'dotenv';
dotenv.config();

export const config = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN ?? '',
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? '',
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
  DATABASE_URL: (process.env.DATABASE_URL ?? 'file:./uelect.sqlite').replace(/^file:/, ''),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE ?? 'Europe/London',
  DEFAULT_UPDATE_INTERVAL_MINUTES: parseInt(process.env.DEFAULT_UPDATE_INTERVAL_MINUTES ?? '60', 10),
  HTTP_TIMEOUT_MS: parseInt(process.env.HTTP_TIMEOUT_MS ?? '10000', 10),
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS ?? '900', 10),
  ENABLE_CIVIC_API: (process.env.ENABLE_CIVIC_API ?? 'false') === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
};
