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

## Visual Design
- **Homepage Design Master**: The homepage (`PublicClubHomePageV2.tsx`) is the visual master for the platform's premium dark theme.
- **Shared Themed Shell**: All non-home pages within a club must use `ThemedClubPageShell.tsx` to ensure visual consistency and correct navigation.
- **Themed Components**: Use `ThemedSectionCard`, `ThemedCard`, and `ThemedPageHeader` for consistent content presentation.

## Routing
- `/`: Minimal platform placeholder.
- `/[clubSlug]`: Entry point for individual clubs (tenants).
- `/[clubSlug]/[pageSlug]`: Individual club pages (About, Articles, Gallery, etc.) using the shared themed shell.
