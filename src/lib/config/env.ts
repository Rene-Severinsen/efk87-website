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
  isDevelopment: boolean;
  isQa: boolean;
  isProduction: boolean;
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

  if (!APP_ENV) {
    throw new Error('APP_ENV is not defined. Must be one of: development, qa, production');
  }

  if (!['development', 'qa', 'production'].includes(APP_ENV)) {
    throw new Error(`Invalid APP_ENV: ${APP_ENV}. Must be one of: development, qa, production`);
  }

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const isDevelopment = APP_ENV === 'development';
  const isQa = APP_ENV === 'qa';
  const isProduction = APP_ENV === 'production';

  return {
    APP_ENV,
    DATABASE_URL,
    isDevelopment,
    isQa,
    isProduction,
    canSendExternalNotifications: isProduction,
  };
}

/**
 * Validated environment configuration.
 * Only exposed to server-side code.
 */
export const env = validateEnv();
