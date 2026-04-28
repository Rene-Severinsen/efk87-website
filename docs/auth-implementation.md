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
- `AUTH_GITHUB_ID`: (Optional) GitHub OAuth client ID.
- `AUTH_GITHUB_SECRET`: (Optional) GitHub OAuth client secret.

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
- `isAdmin`: `boolean` (True if authenticated AND has `ACTIVE` membership AND role is `ADMIN` or `OWNER`)
- `userId?`: `string`
- `email?`: `string`
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
5. If the membership is `ACTIVE` and the role is `ADMIN` or `OWNER`, `isAdmin` is set to `true`.

### Access Guards

`requireActiveMemberForClub(clubId: string, clubSlug: string)`:
1. Calls `getServerViewerForClub(clubId)`.
2. If `viewer.isMember` is `true`, returns the viewer context.
3. Otherwise, redirects to `/{clubSlug}/login?reason=member-required`.

This guard is used to protect member-only routes at the page level.

### Visibility Conversion

`toViewerVisibilityContext(viewer: ServerViewerContext)`:
Converts the full server-side context to the minimal `ViewerVisibilityContext` used for public site filtering.

## Current Limitations

- **No Final Provider**: Auth.js foundation is installed, but no final sign-in provider is implemented for production use yet.
- **Conditional GitHub**: A GitHub provider is configured but only enabled if `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are provided.
- **Verified Endpoint**: The current verified endpoint is `/api/auth/session`.
- **Route Protection**: Member routes are protected by server-side resolution at the page level. Middleware-based protection is not yet implemented.
- **Login Placeholder**: The login page (`/[clubSlug]/login`) is still a placeholder and does not yet contain a real login form or OAuth buttons.
- **No Auto-Creation**: Users are not automatically created in this phase.
