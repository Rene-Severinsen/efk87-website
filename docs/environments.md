# Environment Configuration

This document describes the environment handling and safety rules for the EFK87 platform.

## Supported Environments

The platform supports three distinct runtime environments:

- **development**: Local development environment.
- **qa**: Quality Assurance and testing environment.
- **production**: Live production environment.

## Environment Variables

All environment variables must be accessed through the centralized utility at `src/lib/config/env.ts`. Direct access to `process.env` is discouraged to ensure type safety and validation.

### Required Variables

- `APP_ENV`: Defines the current runtime environment. Must be one of: `development`, `qa`, `production`.
- `DATABASE_URL`: Connection string for the PostgreSQL database.

## Safety Rules

1.  **Secret Management**:
    - Secrets (like `DATABASE_URL`, API keys, etc.) must **never** be committed to the repository.
    - Use the `.env.example` file as a template for local configuration.
2.  **QA Environment Isolation**:
    - The QA environment must **never** use production secrets or databases.
    - The QA environment may later receive sanitized or anonymized production data imports only.
3.  **Notifications & Emails**:
    - Real emails or external notifications must **never** be sent from `development` or `qa` environments.
    - This is controlled by the `canSendExternalNotifications` helper in `src/lib/config/env.ts`.
    - Only `production` is allowed to send external notifications.
4.  **Email Login Safety**:
    - `AUTH_EMAIL_LOGIN_ENABLED` controls whether magic link emails can be sent.
    - Default is `false` for all environments.
    - SMTP configuration (`AUTH_EMAIL_SERVER`, `AUTH_EMAIL_FROM`) must also be present to enable login.
    - QA must not send login links to real members unless explicitly configured with safe test mail.
5.  **Quick Dev Login**:
    - `DEV_LOGIN_ENABLED` allows instant login as a test member in local development.
    - This flag is **only** effective when `APP_ENV=development`.
    - It is automatically disabled in `qa` and `production` even if set to `true`.
    - It must never be enabled in production.

## Usage

In server-side code, import the `env` object:

```typescript
import { env } from '@/lib/config/env';

if (env.isProduction) {
  // Production specific logic
}

if (env.canSendExternalNotifications) {
  // Safe to send emails
}
```

Note: The environment configuration is intentionally not exposed to the client to prevent leaking sensitive information like `DATABASE_URL`.
