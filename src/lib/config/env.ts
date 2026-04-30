/**
 * Environment configuration utility for the EFK87 platform.
 * 
 * This module centralizes all environment variable access and validation.
 * It ensures that required variables are present and correctly typed.
 * 
 * ALWAYS use this utility instead of accessing process.env directly.
 */

export type AppEnv = 'development' | 'qa' | 'production';

interface EnvConfig {
  APP_ENV: AppEnv;
  DATABASE_URL: string;
  AUTH_SECRET: string;
  AUTH_EMAIL_SERVER?: string;
  AUTH_EMAIL_FROM?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_SECURE?: boolean;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  MAIL_FROM?: string;
  APP_BASE_URL?: string;
  isDevelopment: boolean;
  isQa: boolean;
  isProduction: boolean;
  /**
   * Explicit flag to enable email magic link login.
   * Default: false in all environments.
   */
  AUTH_EMAIL_LOGIN_ENABLED: boolean;
  /**
   * Explicit flag to enable quick dev login.
   * ONLY works in development.
   */
  DEV_LOGIN_ENABLED: boolean;
  /**
   * Safety helper to control whether external notifications (emails, etc.) can be sent.
   * development: false
   * qa: false
   * production: true
   */
  canSendExternalNotifications: boolean;
}

function validateEnv(): EnvConfig {
  const APP_ENV = process.env.APP_ENV as AppEnv;
  const DATABASE_URL = process.env.DATABASE_URL;
  const AUTH_SECRET = process.env.AUTH_SECRET;
  const AUTH_EMAIL_SERVER = process.env.AUTH_EMAIL_SERVER;
  const AUTH_EMAIL_FROM = process.env.AUTH_EMAIL_FROM;
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
  const MAIL_FROM = process.env.MAIL_FROM;
  const APP_BASE_URL = process.env.APP_BASE_URL;
  const AUTH_EMAIL_LOGIN_ENABLED = process.env.AUTH_EMAIL_LOGIN_ENABLED === 'true';
  const DEV_LOGIN_ENABLED = process.env.DEV_LOGIN_ENABLED === 'true';

  if (!APP_ENV) {
    throw new Error('APP_ENV is not defined. Must be one of: development, qa, production');
  }

  if (!['development', 'qa', 'production'].includes(APP_ENV)) {
    throw new Error(`Invalid APP_ENV: ${APP_ENV}. Must be one of: development, qa, production`);
  }

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  if (!AUTH_SECRET) {
    throw new Error('AUTH_SECRET is not defined. For local development, add it to your .env file.');
  }

  const isDevelopment = APP_ENV === 'development';
  const isQa = APP_ENV === 'qa';
  const isProduction = APP_ENV === 'production';

  // Safety: DEV_LOGIN_ENABLED must only be true in development
  const safeDevLoginEnabled = isDevelopment && DEV_LOGIN_ENABLED;

  return {
    APP_ENV,
    DATABASE_URL,
    AUTH_SECRET,
    AUTH_EMAIL_SERVER,
    AUTH_EMAIL_FROM,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
    MAIL_FROM,
    APP_BASE_URL,
    isDevelopment,
    isQa,
    isProduction,
    AUTH_EMAIL_LOGIN_ENABLED,
    DEV_LOGIN_ENABLED: safeDevLoginEnabled,
    canSendExternalNotifications: isProduction,
  };
}

/**
 * Validated environment configuration.
 * Only exposed to server-side code.
 */
export const env = validateEnv();
