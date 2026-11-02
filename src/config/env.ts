import dotenv from 'dotenv';
import path from 'node:path';

// Load environment variables from .env file
dotenv.config();

export interface AppConfig {
  PORT: number;
  HOST: string;
  WHATSAPP_SESSION_PATH: string;
  WHATSAPP_GROUP_IDS: string[];
  GITHUB_WEBHOOK_SECRET: string;
  LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  MESSAGE_RATE_LIMIT_MS: number;
  MESSAGE_MAX_RETRIES: number;
  NODE_ENV: 'development' | 'production' | 'test';
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

function parseGroupIds(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

function parseLogLevel(value: string | undefined): AppConfig['LOG_LEVEL'] {
  const validLevels: AppConfig['LOG_LEVEL'][] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  if (value && validLevels.includes(value.toLowerCase() as AppConfig['LOG_LEVEL'])) {
    return value.toLowerCase() as AppConfig['LOG_LEVEL'];
  }
  return 'info';
}

export const config: AppConfig = {
  PORT: parseNumber(process.env['PORT'], 3000),
  HOST: process.env['HOST'] || '0.0.0.0',
  WHATSAPP_SESSION_PATH: path.resolve(process.env['WHATSAPP_SESSION_PATH'] || './auth_info'),
  WHATSAPP_GROUP_IDS: parseGroupIds(process.env['WHATSAPP_GROUP_IDS']),
  GITHUB_WEBHOOK_SECRET: process.env['GITHUB_WEBHOOK_SECRET'] || '',
  LOG_LEVEL: parseLogLevel(process.env['LOG_LEVEL']),
  MESSAGE_RATE_LIMIT_MS: parseNumber(process.env['MESSAGE_RATE_LIMIT_MS'], 1000),
  MESSAGE_MAX_RETRIES: parseNumber(process.env['MESSAGE_MAX_RETRIES'], 3),
  NODE_ENV: (process.env['NODE_ENV'] as AppConfig['NODE_ENV']) || 'development',
};
