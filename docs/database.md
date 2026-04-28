# Database Documentation

## Prisma 7 Configuration

The EFK87 platform uses Prisma 7 with a specific configuration to handle multi-tenancy and environment-specific database URLs.

### Datasource URL Handling

- **`prisma.config.ts`**: The `DATABASE_URL` is handled exclusively in `prisma.config.ts`.
- **`schema.prisma`**: The `prisma/schema.prisma` file **must not** contain a `url` property in the `datasource` block. This ensures that the database connection is managed programmatically and remains consistent across different environments (dev, qa, prod).

```typescript
// prisma.config.ts
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // ...
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### Shared Prisma Client

A global shared Prisma client instance is provided to avoid exhausting database connections during development due to Next.js hot reloading.

- **Path**: `src/lib/db/prisma.ts`
- **Usage**: Always import the prisma instance from this path.

```typescript
import prisma from "@/lib/db/prisma";

// Example usage:
// const clubs = await prisma.club.findMany();
```

### Seeding

The database seed logic is idempotent and ensures that the initial platform data is present without resetting or deleting existing data.

- **Path**: `prisma/seed.ts`
- **Command**: `npm run db:seed` (or `npx prisma db seed`)
- **Behavior**: Uses `upsert` to ensure that records like the initial club are created if they don't exist or remain unchanged if they do.

### Multi-tenancy (Clubs)

The platform is designed to support multiple clubs/tenants.

- **First Tenant**: `EFK87` is seeded as the first club.
- **Tenant Isolation**: All future core data models must support a `clubId` or similar tenant structure to ensure data isolation between different clubs.
- **Independence**: `EFK87` is the initial tenant but is not hardcoded into the platform's core business logic. The platform should be capable of hosting other clubs by adding them to the `Club` model.

### Environment Separation

The principle of separation between `dev`, `qa`, and `prod` environments is maintained by:
1. Using environment variables for `DATABASE_URL`.
2. Managing connection strings via `prisma.config.ts`.
3. Ensuring seeds are idempotent and safe to run in any environment.
