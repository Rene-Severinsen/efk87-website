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

The database seed logic is idempotent and ensures that the initial platform data is present without resetting or deleting existing data. Seed data is limited to core structure and essential test users.

- **Path**: `prisma/seed.ts`
- **Command**: `npm run db:seed` (or `npx prisma db seed`)
- **Behavior**: Uses `upsert` to ensure that records like the initial club are created if they don't exist or remain unchanged if they do.
- **Dev/Test Data**: When `APP_ENV=development`, the seed script adds a test member (`test.member@efk87.local`) with `ACTIVE` membership in EFK87 for local testing. See `docs/auth-implementation.md` for details.

### Multi-tenancy (Clubs)

The platform is designed to support multiple clubs/tenants.

- **First Tenant**: `EFK87` is seeded as the first club.
- **Tenant Isolation**: All future core data models must support a `clubId` or similar tenant structure to ensure data isolation between different clubs.
- **Independence**: `EFK87` is the initial tenant but is not hardcoded into the platform's core business logic. The platform should be capable of hosting other clubs by adding them to the `Club` model.

### Core Foundation Models

#### ClubSettings
Stores basic configuration for a club, such as display name, short name, and public contact information. Each `Club` has exactly one `ClubSettings`.

#### User vs ClubMembership
- **User**: Represents a person on the platform. A user is independent of any specific club and is identified by a unique email address.
- **ClubMembership**: Links a `User` to a `Club`. This separation allows a single user to potentially be a member of multiple clubs (multi-tenancy) and maintains a clear boundary between identity and club-specific affiliation.
- **Membership Scope**: A membership always belongs to a specific club via `clubId`. This ensures that roles and statuses are context-specific.
- **Roles & Status**: Currently uses simple enums (`ClubRole` and `MembershipStatus`) to manage access level and account state within a club.

#### MemberDailyActivity
Tenant-scoped activity tracking. Each record represents one user's activity for one club on one specific day (`activityDate`). This replaces global user activity tracking to support multi-tenancy.
- **Constraints**: Unique combination of `clubId` + `userId` + `activityDate`.
- **Purpose**: Power "Senest online" and future per-club activity statistics without exposing cross-club activity.

#### ClubCalendarEntry
Tenant-scoped calendar entries used for club events and homepage visibility.
- **Fields**: id, clubId, title, descriptionHtml (sanitized), startsAt, endsAt (optional), location (optional), isPublished, forceShowInMarquee.
- **Logic**: Used as the data source for the homepage marquee/ticker.
- **Constraints**: Scoped by `clubId`. Published entries are visible publicly.

#### ClubMemberProfile
Stores club-specific member stamdata (profile information).
- **Constraints**: Unique combination of `clubId` + `userId`.
- **Fields**: Name, address, phone, Medlemsnummer (`memberNumber`), MDK number, profile image URL, membership type, club role, school status, member status.
- **Uniqueness**: `memberNumber` is unique per `clubId`.
- **Automatic Assignment**: `memberNumber` is assigned automatically when a new profile is created for a club, using a max+1 logic scoped to that club.
- **Privacy**: Contains private member data, strictly tenant-scoped.

#### Homepage Content
Tenant-scoped module for announcements and messages on the club's homepage.
- **HomepageContent**: Manageable content boxes.
  - `isActive`: Boolean flag for immediate control.
  - `visibility`: `PUBLIC` (everyone) or `MEMBERS_ONLY` (logged-in members).
  - `visibleFrom` / `visibleUntil`: Optional date range for scheduled visibility.
  - `signupMode`: `NONE`, `ONE_PER_MEMBER` (once per user), or `QUANTITY` (user enters quantity).
  - `isSignupClosed`: Boolean flag to close registrations while keeping the content visible.
- **HomepageContentSignup**: User registrations for specific homepage content.
  - Scoped by `clubId`, `contentId`, and `userId`.
  - Supports `quantity` (default 1) and optional `note`.
  - Tracks `cancelledAt` and `cancelledByUserId` for administrative management.

#### ClubMemberCertificate
Normalized storage for member certificates.
- **Constraints**: Unique combination of `clubId` + `userId` + `certificateType`.
- **Enum**: `ClubMemberCertificateType` (A_CERTIFICATE, S_CONTROLLER, etc.).

#### Club Forum
Tenant-scoped forum module for club members.
- **ClubForumCategory**: Manageable headings for threads. Scoped by `clubId`. Unique `slug` per club.
  - `notificationEmail` (String?): Optional admin-managed email address for notifications on new threads and replies.
- **ClubForumThread**: Member-created discussions. Scoped by `clubId` and `categoryId`. Automatically assigned `iconKey` based on title/category. Unique `slug` per category.
- **ClubForumReply**: Member replies to threads. Scoped by `clubId` and `threadId`.
- **Logic**: Threads track `lastActivityAt` and `replyCount` for efficient listing and homepage activity feed.
- **Notifications**: 
  - Thread author receives email on new replies (unless they are the author of the reply).
  - Category `notificationEmail` receives email on new threads and replies.
- **Security**: Access is generally `MEMBERS_ONLY`.

> **Note**: Authentication (login, password management, etc.) is not yet implemented. The `User` model currently only serves as a profile and membership anchor.

### Environment Separation

The principle of separation between `dev`, `qa`, and `prod` environments is maintained by:
1. Using environment variables for `DATABASE_URL`.
2. Managing connection strings via `prisma.config.ts`.
3. Ensuring seeds are idempotent and safe to run in any environment.

## Database workflow

### Scripts

- `npm run db:migrate`: Use for local schema changes. This command should be used during development to create and apply migrations to your local database.
- `npm run db:deploy`: Use for QA/prod deployment. This command applies pending migrations to the database without needing the `prisma` CLI or interactive prompts.
- `npm run db:seed`: Use for idempotent seed data. Safe to run multiple times; it will only create records if they don't already exist.
- `npm run db:push`: **Only for local prototyping.** This command synchronizes the schema with the database without creating a migration file. It must **not** be used for QA or production environments.
- `npm run db:generate`: Generates the Prisma Client based on the current schema.

### Workflow Principles

- **Migrations as Source of Truth**: Migrations are the definitive source of truth for the database schema history. All schema changes must be captured in migration files before being deployed to shared environments.
- **Environment Isolation**: QA may later import sanitized production data for testing, but it must never use production secrets or trigger real notifications (e.g., emails) to actual users.
- **Idempotency**: All database tasks, especially seeding, must be idempotent to ensure they can be safely re-run without causing data corruption or duplication.
