# Tenancy Foundation

The EFK87 platform is designed as a multi-tenant system where each **Club** represents a tenant root. All club-specific data must be scoped by `clubId`.

## Core Concepts

- **Club**: The primary tenant entity.
- **Tenant Resolution**: The process of identifying which Club a request belongs to.
- **EFK87**: The first tenant on the platform, used for initial seeding and development.

## Tenant Resolution

Tenancy resolution must always use the shared utilities in `src/lib/tenancy/`.

### Resolution Methods

Currently, the platform supports:

1.  **Slug-based Resolution**: Resolving a club based on a unique URL slug (e.g., `efk87`).
2.  **Domain-based Resolution (Future)**: Resolving a club based on the request's custom domain or subdomain.

### Utilities

- `getClubBySlug(slug: string)`: Returns the club and its settings, or `null` if not found. Normalizes the slug before lookup.
- `requireClubBySlug(slug: string)`: Same as above but throws a `TenancyError` if not found.
- `getClubByDomain(domain: string)`: Placeholder for future domain-based resolution. Currently looks up `ClubSettings.primaryDomain`.

## Routing & Implementation

### Public Routes
The platform uses slug-based routing for public club pages:
- Pattern: `/[clubSlug]`
- Implementation: `src/app/[clubSlug]/page.tsx`

### Usage in Pages
Pages must use `tenantService` (specifically `requireClubBySlug`) to resolve the tenant, rather than querying Prisma directly. This ensures that slug normalization and necessary relations (like `settings`) are handled consistently.

Example of tenant resolution in a page:
```tsx
const club = await requireClubBySlug(params.clubSlug);
```

### Examples
- Current example: [/efk87](/efk87)

### Custom Domains
Future custom domain resolution is not yet implemented in the routing middleware. Currently, all clubs are accessed via their slug on the primary platform domain.

## Development Guidelines

- **Do Not Hardcode**: Never hardcode `efk87` or any other club ID/slug in business logic.
- **Centralized Logic**: Always use `tenantService.ts` for club lookups to ensure consistent query patterns and includes (e.g., always including `ClubSettings`).
- **Data Scoping**: Every new model that belongs to a club must have a `clubId` field and should be queried with that scope.
- **Prisma Usage**: Use the shared Prisma client from `src/lib/db/prisma.ts`.
