# Auth.js Implementation Detail

This document details the Auth.js foundation implemented for the EFK87 platform.

## Configuration

### Packages
- `next-auth`: Core Auth.js package.
- `@auth/prisma-adapter`: Official Prisma adapter for Auth.js.

### Files
- `src/auth.ts`: Central Auth.js configuration.
- `src/app/api/auth/[...nextauth]/route.ts`: App Router route handler for auth endpoints.
- `src/lib/config/env.ts`: Validates `AUTH_SECRET` environment variable.

### Environment Variables
- `AUTH_SECRET`: Used to sign cookies and tokens.
- `AUTH_GITHUB_ID`: (Optional) GitHub OAuth client ID for dev/testing.
- `AUTH_GITHUB_SECRET`: (Optional) GitHub OAuth client secret for dev/testing.
- `AUTH_EMAIL_SERVER`: (Optional) SMTP connection string (e.g., `smtp://user:pass@smtp.example.com:587`).
- `AUTH_EMAIL_FROM`: (Optional) The "From" address for magic link emails.
- `AUTH_EMAIL_LOGIN_ENABLED`: Explicit flag to enable email magic link login. MUST be `true` for any environment to send magic links.
- `DEV_LOGIN_ENABLED`: (Development only) Explicit flag to enable quick "Snyde-login" as the test member.

#### Email Provider Activation
The Email (Nodemailer) provider is enabled only if `AUTH_EMAIL_LOGIN_ENABLED` is `true` AND both `AUTH_EMAIL_SERVER` and `AUTH_EMAIL_FROM` are present. If `AUTH_EMAIL_LOGIN_ENABLED` is missing or `false`, the login page shows an informational message. If enabled but SMTP is missing, it shows a configuration warning.

## Data Model

The existing `User` model was updated and new models were added to `prisma/schema.prisma` to support the Auth.js Prisma adapter:

- `User`: Added `emailVerified` and `image` fields.
- `Account`: Stores OAuth account information (future use).
- `Session`: Stores database-backed sessions.
- `VerificationToken`: Used for magic link/email verification (future use).

## User Identity and Tenancy

- **Identity**: Auth.js identifies a `User` by their email. The `User` record is shared across all clubs.
- **Tenancy**: Club membership is handled by the `ClubMembership` model. An authenticated user does not automatically have access to any club.
- **Access Control**: Membership lookups for a specific club are performed server-side during viewer resolution.

## Viewer Resolution Foundation

A reusable server-side viewer resolution is implemented in `src/lib/auth/viewer.ts` and access guards in `src/lib/auth/accessGuards.ts`.

### ServerViewerContext

The `ServerViewerContext` includes:
- `isAuthenticated`: `boolean`
- `isMember`: `boolean` (True if authenticated AND has `ACTIVE` membership in the current club)
- `isAdmin`: `boolean` (True if authenticated AND (has `ACTIVE` membership AND role is `ADMIN` or `OWNER` OR has `ACTIVE` ClubMemberProfile AND eligible board role))
- `userId?`: `string`
- `email?`: `string`
- `name?`: `string | null`
- `clubId?`: `string`
- `membershipStatus?`: `MembershipStatus`
- `clubRole?`: `ClubRole`
- `isPlatformAdmin?`: `boolean` (Always `false` for now)

### Resolution Logic

`getServerViewerForClub(clubId: string)`:
1. Calls Auth.js `auth()` server-side.
2. If no session/user/email, returns an anonymous viewer.
3. Finds the `User` by email and checks for `ClubMembership` in the specified `clubId`.
4. If an `ACTIVE` membership exists, `isMember` is set to `true`.
8. If the membership is `ACTIVE` and the role is `ADMIN` or `OWNER`, OR if the user has an `ACTIVE` `ClubMemberProfile` with an eligible board role (`CHAIRMAN`, `VICE_CHAIRMAN`, `BOARD_MEMBER`, `TREASURER`), `isAdmin` is set to `true`.

### Access Guards

`requireActiveMemberForClub(clubId: string, clubSlug: string, callbackUrl?: string)`:
1. Calls `getServerViewerForClub(clubId)`.
2. If `viewer.isMember` is `true`, returns the viewer context.
3. Otherwise, redirects to `/{clubSlug}/login?reason=member-required&callbackUrl={callbackUrl}`.

This guard is used to protect member-only routes at the page level.

`requireClubAdminForClub(clubId: string, clubSlug: string, callbackUrl?: string)`:
1. Calls `getServerViewerForClub(clubId)`.
2. If `viewer.isAdmin` is `true`, returns the viewer context.
3. Otherwise, redirects to `/{clubSlug}/login?reason=admin-required&callbackUrl={callbackUrl}`.

This guard is used to protect admin-only routes at the page level.

## Login Page (`/[clubSlug]/login`)

The login page handles both email magic links and development quick login.

### Callback URL Handling

To provide a smooth user experience, the login flow preserves the originally requested protected path:
- Protected routes include a `callbackUrl` parameter when redirecting to login.
- The login page validates this URL to prevent open redirect vulnerabilities.
- Validated `callbackUrl` must start with `/${clubSlug}`, must not be protocol-relative (`//`), and must not be an absolute external URL.
- If invalid or missing, it falls back to `/${clubSlug}`.
- This validated URL is passed to Auth.js `signIn` as the `redirectTo` option.

## Member Routes

### Profile Page (`/[clubSlug]/profil`)
The member profile page is protected by the `requireActiveMemberForClub` guard. It renders the member's personal information, certificates, and mailing list subscriptions.

- **Data**: Uses real identity and membership data from the `ServerViewerContext`.
- **Mockup**: Follows the approved "Min profil" mockup visually.
- **V1 Status**: Editing, profile image upload, password change, and mailing list/certificate synchronization are not implemented in V1 and remain as visual placeholders.

### Visibility Conversion

`toViewerVisibilityContext(viewer: ServerViewerContext)`:
Converts the full server-side context to the minimal `ViewerVisibilityContext` used for public site filtering.

## Operational Requirements

### Logout

Logout is implemented using a server action (`logoutAction` in `src/lib/auth/logout.ts`) that calls Auth.js `signOut`.
- **Redirect**: After logout, the user is redirected back to the club's home page (`/[clubSlug]`).
- **CSRF Safety**: Handled automatically by Auth.js through the use of server actions and forms.

### Local Test Member

For development and verification of protected member routes, a local test member is seeded when `APP_ENV=development`.

- **Email**: `test.member@efk87.local`
- **Name**: `Test Member`
- **Club Access**: `ACTIVE` membership with `MEMBER` role for EFK87.
- **Purpose**: Used to verify viewer resolution and protected member routes without needing real member data.
- **Safety**: 
  - This is a local development test identity only. 
  - It must not be treated as a real member.
  - It is guarded in the seed file and only created when `APP_ENV` is `development`.
  - It must not be seeded in production long term.
  - Magic link testing still requires `AUTH_EMAIL_LOGIN_ENABLED=true` and safe SMTP/mail capture. See [Local Magic Link Testing Workflow](./auth-local-testing.md) for details.
  - Authentication alone is not enough; matching User email and `ACTIVE` `ClubMembership` are required.

### Email Delivery
- **Provider**: Uses Auth.js Email/Nodemailer provider.
- **Packages**: `nodemailer` is installed as a separate dependency.
- **Environment Specificity**: SMTP/provider credentials must be environment-specific (Dev, QA, Production).
- **Template Design**: Email templates currently use Auth.js defaults.

### QA and Testing Safety
- **Outbound Guard**: `canSendExternalNotifications` in `src/lib/config/env.ts` is `false` for development and qa.
- **Login Guard**: `AUTH_EMAIL_LOGIN_ENABLED` must be `false` by default for all environments.
- **QA Restriction**: QA MUST NOT send login links to real members unless explicitly configured with a safe test mail flag (or when `AUTH_EMAIL_LOGIN_ENABLED=true` is used with a safe SMTP mock like Mailpit).
- **Real SMTP**: Production requires `AUTH_EMAIL_LOGIN_ENABLED=true` and valid SMTP config.

### Production Readiness
- **Credentials**: Production must use real, authenticated mail provider credentials.
- **Monitoring**: Email delivery success should be monitored to ensure members can always log in.

## Magic Link Flow

1.  **Request**: User enters their email on the login page.
2.  **Verification**: Auth.js creates a `VerificationToken` in the database.
3.  **Delivery**: An email is sent to the user containing a unique, time-limited magic link.
4.  **Callback**: Clicking the link hits the Auth.js callback route.
5.  **Identity Mapping**: The callback verifies the token and maps the email to a `User` record in the database.
6.  **Session**: A persistent `Session` is created for the user.

### Quick Dev Login (Snyde-login)

To speed up local development, a "Snyde-login" button is available on the login page when `APP_ENV=development` and `DEV_LOGIN_ENABLED=true`.

- **Mechanism**: Uses Auth.js `Credentials` provider.
- **Identity**: Always logs in as `test.member@efk87.local`.
- **Safety**: 
  - The provider is only registered in the `auth.ts` configuration if the environment is strictly `development` and the flag is enabled.
  - The `authorize` function in the provider explicitly checks the environment flag again.
  - It only allows logging in as the pre-defined test user found by email in the database.
  - It does not accept any user-provided credentials.
  - Access control still depends on `ClubMembership` checks after the session is created.
  - It is completely disabled in `qa` and `production` environments by the environment validator.

### Access Control Post-Login
- **Identity != Membership**: Authenticated user identity does not grant club access.
- **Membership Check**: Access to member routes still requires an `ACTIVE` `ClubMembership` record for the specific club being accessed.
- **Graceful Failure**: An authenticated user without a membership can log in but will be redirected or shown an "Access Denied" message when attempting to access member-only routes.

## Current Limitations

- **No Final Provider**: Auth.js foundation is installed, but no final sign-in provider is implemented for production use yet.
- **Conditional GitHub**: A GitHub provider is configured but only enabled if `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are provided.
- **Verified Endpoint**: The current verified endpoint is `/api/auth/session`.
- **Route Protection**: Member routes are protected by server-side resolution at the page level. Middleware-based protection is not yet implemented.
- **Login Placeholder**: The login page (`/[clubSlug]/login`) is still a placeholder and does not yet contain a real login form or OAuth buttons.
- **No Auto-Creation**: Users are not automatically created in this phase.
