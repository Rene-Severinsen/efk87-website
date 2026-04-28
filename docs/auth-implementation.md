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
- **Tenancy**: Club membership is still handled by the `ClubMembership` model. An authenticated user does not automatically have access to any club.
- **Access Control**: Membership lookups for a specific club must still be performed after the user is authenticated.

## Current Limitations

- **No Final Provider**: Auth.js foundation is installed, but no final sign-in provider is implemented for production use yet.
- **Conditional GitHub**: A GitHub provider is configured but only enabled if `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are provided. It is intended for development/testing only until a final strategy is selected.
- **Verified Endpoint**: The current verified endpoint is `/api/auth/session`.
- **No Protection**: No routes are protected by authentication in this phase.
- **Viewer Context**: The `anonymousViewer` is still used throughout the application. Authenticated identity still requires `ClubMembership` lookup for club access.

## Next Phase: Viewer Resolution

The next phase of implementation will involve:
1. Resolving the Auth.js session on the server.
2. Looking up the `ClubMembership` for the authenticated user and the current `clubSlug`.
3. Replacing `anonymousViewer` with a dynamic viewer context based on the resolved session and membership.
