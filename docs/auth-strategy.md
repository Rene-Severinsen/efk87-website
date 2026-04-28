# Authentication and Member Access Strategy

This document outlines the strategy for authentication and access control for the platform. It defines how users are identified, how they belong to clubs, and how access to protected features is managed.

## Overview

The platform uses a multi-tenant architecture where a single instance can serve multiple clubs. Authentication identifies a **User**, while **ClubMembership** defines that user's relationship and permissions within a specific **Club**.

## Access Levels

The platform supports the following access levels:

1.  **Anonymous Public Visitor**: Not logged in. Can only access public routes and content.
2.  **Authenticated User**: Logged in but might not have an active membership in the current club.
3.  **Club Member**: Authenticated user with an `ACTIVE` membership in the current club.
4.  **Club Admin**: Authenticated user with `ADMIN` or `OWNER` role in the current club.
5.  **Club Owner**: Authenticated user with `OWNER` role in the current club.
6.  **Platform Admin**: Future role with cross-club management capabilities (e.g., creating new clubs).

## Data Model Integration

Authentication will connect directly to the existing Prisma models:

### Identity: `User` model
- Represents a unique identity across the entire platform.
- Primary identifier is `email`.
- Authentication sessions must map to a `User` record.

### Authorization: `ClubMembership` model
- Connects a `User` to a `Club`.
- **Roles (`ClubRole`)**: `MEMBER`, `ADMIN`, `OWNER`.
- **Status (`MembershipStatus`)**:
    - `ACTIVE`: Granted access to member-only features.
    - `INVITED`: Pending acceptance; no member access yet.
    - `DISABLED`: Access revoked.

### Viewer Context

The existing `ViewerVisibilityContext` in `src/lib/publicSite/publicVisibility.ts` serves as the foundation for visibility checks:

```typescript
export type ViewerVisibilityContext = {
  isAuthenticated: boolean;
  isMember: boolean;
  isAdmin: boolean;
};
```

**Future Integration**:
- The `anonymousViewer` constant will be replaced by a dynamic context resolved from the session.
- `isAuthenticated` will be true if a valid session exists.
- `isMember` will be true if the user has an `ACTIVE` membership for the current `clubSlug`.
- `isAdmin` will be true if the user has an `ADMIN` or `OWNER` role for the current `clubSlug`.

## Viewer Context Evolution

The current `ViewerVisibilityContext` is intentionally minimal, primarily supporting public vs. member visibility decisions today. As the platform grows, the authentication strategy must evolve to handle more granular permissions without overloading a single `isAdmin` flag for every privileged use case.

- **Explicit Role Resolution**: Club admin, club owner, and platform admin roles must be resolved explicitly.
- **Separation of Concerns**: A platform admin is not the same as a club admin. While platform admins may manage clubs globally in the future, they should not automatically become members of every club unless explicitly designed.
- **Role Inheritance**: 
    - Club Owner inherits Club Admin and Member permissions.
    - Club Admin inherits Member permissions.

### Recommended Future Viewer Shape

Conceptually, the future viewer context should provide more detail:

- `isAuthenticated`: (boolean) Whether the user is logged in.
- `userId`: (optional string) The unique ID of the authenticated user.
- `clubId`: (optional string) The ID of the club currently being accessed.
- `membershipStatus`: (optional `MembershipStatus`) The status of the user's membership in the current club (e.g., `ACTIVE`).
- `clubRole`: (optional `ClubRole`) The specific role the user has in the current club (e.g., `MEMBER`, `ADMIN`, `OWNER`).
- `isPlatformAdmin`: (optional boolean) Whether the user has global platform management permissions.

### Recommended Future Access Helpers

To simplify authorization logic throughout the app, the following helpers should be implemented:

- `canAccessPublicContent(viewer)`
- `canAccessMemberArea(viewer, clubId)`
- `canAccessClubAdmin(viewer, clubId)`
- `canAccessClubOwnerFeatures(viewer, clubId)`
- `canAccessPlatformAdmin(viewer)`

## Routing Strategy

### Public Routes (No Auth Required)
- `/[clubSlug]` (Home)
- `/[clubSlug]/about`
- `/[clubSlug]/galleri`
- `/[clubSlug]/artikler`
- `/[clubSlug]/flyveskole`
- `/[clubSlug]/bliv-medlem`
- `/[clubSlug]/login`

### Protected Member Routes (Auth + Active Membership Required)
Access to these routes requires the user to be authenticated AND have an `ACTIVE` membership in the current club.
- `/[clubSlug]/profil`
- `/[clubSlug]/forum`
- `/[clubSlug]/jeg-flyver` (Flight logging)

### Admin Routes (Auth + Admin/Owner Role Required)
- `/[clubSlug]/admin`: Club-level administration. Requires `ACTIVE` membership plus `ADMIN` or `OWNER` role.
- `/[clubSlug]/owner-tools`: (Conceptual) Features requiring `ACTIVE` membership plus `OWNER` role.
- `/admin` (or similar): Future platform-level administration. Requires platform-level permission (`isPlatformAdmin`), not merely a `ClubRole`.

## "Jeg flyver" (I'm Flying) Logic
The "Jeg flyver" feature allows members to announce their flight intentions.
- **Requirement**: Submit requires an authenticated `ACTIVE` membership.
- **Visibility**: 
    - Public display may show limited rows (marked as `PUBLIC`).
    - Member view may later show `MEMBERS_ONLY` rows.
- **Data Retention**: Statistics and historical overviews must use retained data, not just currently visible rows.
- **Persistence**: Data must be preserved even after the flight date.

## Auth Provider Candidate: Auth.js (Selected)

Auth.js (formerly NextAuth.js) is the authentication foundation for the EFK87 platform.

### Preferred Login Method: Email Magic Link

The primary and preferred authentication method for club members is **Email Magic Link**.

#### Rationale
- **Member Identification**: Club members naturally identify by their email addresses already present in club records.
- **Low Friction**: Simplest experience for non-technical members; no passwords to remember or manage.
- **Security**: No password storage or password reset complexity. Authentication relies on the security of the user's email account.
- **Generic Identity**: Keeps identity generic across future clubs and tenants.
- **Infrastructure Fit**: Fits perfectly with the self-hosted PostgreSQL/Prisma/Auth.js setup.

#### Developer/Testing Method: GitHub OAuth
- GitHub remains an **optional, developer-only** login method.
- It is only available if conditionally configured via environment variables.
- It is **not** the default or intended login method for regular club members.

### Implementation Foundation (Current Phase)
The platform has the Auth.js foundation installed and configured:
- **Status**: Foundation is installed. Email Magic Link is defined as the primary strategy.
- **Providers**: 
    - **Email Provider**: (Planned) Will handle magic link generation and delivery.
    - **GitHub Provider**: Conditionally available for development/testing only.
- **Verified Endpoint**: `/api/auth/session` is the current verified endpoint.
- **Package**: `next-auth` and `@auth/prisma-adapter`.
- **Database**: Prisma integration using the standard Auth.js adapter models (`Account`, `Session`, `VerificationToken`) and updating the existing `User` model.
- **Route Handler**: `src/app/api/auth/[...nextauth]/route.ts` handles Auth.js requests using Next.js App Router.
- **Configuration**: `src/auth.ts` provides the central configuration and exports `auth`, `handlers`, `signIn`, and `signOut`.

### Selection Criteria
- **Simplicity**: Low maintenance and easy to understand.
- **Self-hosted Compatibility**: Must be able to run in a standard Docker/PostgreSQL environment.
- **PostgreSQL/Prisma Support**: Should leverage existing database infrastructure.
- **Multi-club Membership**: Must support a single user being a member of multiple clubs.
- **Operational Complexity**: Minimal external dependencies preferred.

## Implementation Sequence

1.  **Auth.js Foundation**: Install and configure Auth.js with Prisma. (Completed ✓)
2.  **Strategy Documentation**: Define Email Magic Link strategy and requirements. (Completed ✓)
3.  **Email Provider Setup**: 
    - Configure environment variables for the selected SMTP provider (`AUTH_EMAIL_SERVER`, `AUTH_EMAIL_FROM`). (Completed ✓)
4.  **Auth.js Email Configuration**: 
    - Enable and configure the Email provider in `src/auth.ts` using `nodemailer`. (Completed ✓)
5.  **Login UI**: 
    - Create a minimal login page with email input and magic link trigger. (Completed ✓)
6.  **Viewer & Guards**: 
    - Replace `anonymousViewer` with real session resolution.
    - Verify member route access still depends on `ACTIVE` `ClubMembership`.
7.  **Enable “Jeg flyver” Submit Flow**: Connect the UI to a protected API action that verifies the viewer context.

## Future Considerations
- **Calendar**: A future simple calendar/overview for club activities (not a complex event system).
- **Platform Admin**: A separate dashboard for platform owners to manage clubs and global settings.
