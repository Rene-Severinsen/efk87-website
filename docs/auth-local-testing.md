# Local Magic Link Testing Workflow

This document describes how to test Auth.js email magic link login locally without sending real emails.

## Safe Local SMTP Testing

Local testing must use a safe SMTP capture tool to intercept outgoing emails. This ensures no real emails are sent during development.

### Recommended Tools
- **Mailpit**: Modern, fast, and includes a web UI.
- **MailHog**: Classic SMTP testing tool.

Both tools typically run an SMTP server on port `1025` and a web UI on port `8025`.

## Environment Configuration

To enable magic link testing locally, ensure your `.env` (or `.env.local`) includes the following:

```env
APP_ENV=development
AUTH_EMAIL_LOGIN_ENABLED=true
AUTH_EMAIL_SERVER=smtp://localhost:1025
AUTH_EMAIL_FROM=no-reply@efk87.local
AUTH_SECRET=your-development-auth-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/efk87
```

- `AUTH_SECRET` must be set to any random string for local development.
- `DATABASE_URL` must point to your local PostgreSQL instance.

## Test User

A test member is provided in the seed data for development:

- **Email**: `test.member@efk87.local`
- **Club Access**: EFK87 (slug: `efk87`)
- **Status**: `ACTIVE`

## Step-by-Step Testing Workflow

1.  **Start Mail Capture**: Ensure Mailpit or MailHog is running and listening on port `1025`.
2.  **Prepare Database**:
    ```bash
    npm run db:seed
    ```
3.  **Start Application**:
    ```bash
    npm run dev
    ```
4.  **Initiate Login**:
    - Open: [http://localhost:3000/efk87/login](http://localhost:3000/efk87/login)
    - Submit email: `test.member@efk87.local`
5.  **Capture Magic Link**:
    - Open Mailpit/MailHog UI: [http://localhost:8025](http://localhost:8025)
    - Locate the "Sign in to efk87.local" email.
    - Click the **Sign in** button/link.
6.  **Verify Session**:
    - You should be redirected back to the site.
    - Verify authentication by checking: [http://localhost:3000/api/auth/session](http://localhost:3000/api/auth/session) (should return a JSON session object).
7.  **Verify Protected Access**:
    - Navigate to protected routes and ensure they no longer redirect to login:
        - `/efk87/profil`
        - `/efk87/forum`
        - `/efk87/jeg-flyver`

## Access Control Requirements

Successful authentication is only the first step. Protected access still requires:

1.  **Authenticated user email** matching a `User.email` in the database.
2.  **ACTIVE ClubMembership** for the user in the current club (e.g., `clubId` for EFK87).

## Troubleshooting

### No email received
- Check `AUTH_EMAIL_LOGIN_ENABLED=true` is set.
- Check `AUTH_EMAIL_SERVER=smtp://localhost:1025` matches your mail capture tool.
- Ensure the mail capture service (Mailpit/MailHog) is actually running.

### Login succeeds but member routes redirect
- Check the `User` record exists in the database for that email.
- Check that a `ClubMembership` exists for that user.
- Ensure the membership status is `ACTIVE`.
- Ensure the `clubId` in the membership matches the club you are accessing (e.g., EFK87).

### Session empty or missing
- Check `AUTH_SECRET` is set and consistent.
- Check the callback URL in the magic link matches your `NEXTAUTH_URL` or `localhost:3000`.
- Check browser cookies for `authjs.session-token` or similar.
- Ensure you are using a consistent URL (don't mix `localhost` and `127.0.0.1`).
