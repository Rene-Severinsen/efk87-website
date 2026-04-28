# App Structure

This document outlines the canonical structure of the EFK87 Next.js application.

## Directory Layout

- `src/app`: The canonical Next.js App Router directory.
  - Global layout, metadata, and base styling are defined here.
  - `/`: Platform-level root page.
  - `/[clubSlug]`: Tenant-level routes, resolved via `tenantService`.
- `src/lib`: Contains reusable application logic, services, and utilities.
- `public`: Static assets.
- `prisma`: Database schema and migrations.

## Key Principles

- **Shared Services**: Pages and components should use shared services from `src/lib` (e.g., `tenantService`) instead of querying Prisma directly whenever possible.
- **Tenancy**: The application is designed as a multi-club platform.
  - Platform-level logic resides at the root of `src/app`.
  - Tenant-specific logic resides under the `[clubSlug]` dynamic route.
- **Styling**: Tailwind CSS is used for styling. Global styles are defined in `src/app/globals.css`.
- **Design Foundation**: Modern business/club-platform expression. Future design phases will reuse existing mockup examples.

## Routing

- `/`: Minimal platform placeholder.
- `/[clubSlug]`: Entry point for individual clubs (tenants).
