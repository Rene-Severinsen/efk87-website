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
- `/[clubSlug]/admin`: Club-level administration.
- `/admin` (or similar): Future platform-level administration.

## "Jeg flyver" (I'm Flying) Logic
The "Jeg flyver" feature allows members to announce their flight intentions.
- **Requirement**: Must be an authenticated `ACTIVE` member.
- **Data**: Must support current or future `flightDate`.
- **Persistence**: Data must be preserved even after the flight date for statistics and historical overview.

## Auth Provider Candidates

No final decision has been made. The following candidates should be evaluated:

| Candidate | Pros | Cons |
| :--- | :--- | :--- |
| **Auth.js (NextAuth)** | Deep Next.js integration, supports many providers, Prisma adapter available. | Can be complex to customize beyond standard flows. |
| **Custom Magic Link** | Simple, no passwords, high security, full control. | Requires implementing own session management and email delivery logic. |
| **External IDP (e.g., Clerk, Kinde)** | Lowest implementation effort, feature-rich. | Potential vendor lock-in, higher cost at scale, may complicate self-hosting. |

### Selection Criteria
- **Simplicity**: Low maintenance and easy to understand.
- **Self-hosted Compatibility**: Must be able to run in a standard Docker/PostgreSQL environment.
- **PostgreSQL/Prisma Support**: Should leverage existing database infrastructure.
- **Multi-club Membership**: Must support a single user being a member of multiple clubs.
- **Operational Complexity**: Minimal external dependencies preferred.

## Recommended Implementation Sequence

1.  **Decide Auth Provider**: Evaluate candidates against criteria.
2.  **Implement Session/User Lookup**: Set up the auth provider and session handling.
3.  **Map Session User to User**: Ensure authenticated users are matched/created in the `User` table.
4.  **Resolve ClubMembership**: For every request to a club-specific route, resolve the user's membership for that specific club.
5.  **Replace anonymousViewer**: Update the viewer context resolution to use real session and membership data.
6.  **Protect Member Routes**: Implement middleware or layout-level checks for protected routes.
7.  **Enable “Jeg flyver” Submit Flow**: Connect the UI to a protected API action that verifies the viewer context.

## Future Considerations
- **Calendar**: A future simple calendar/overview for club activities (not a complex event system).
- **Platform Admin**: A separate dashboard for platform owners to manage clubs and global settings.
