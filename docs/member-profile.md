# Member Profile Page

This document describes the implementation of the member profile page (`/[clubSlug]/profil`).

## Overview

The member profile page is a protected route that allows active members to view their profile information, membership status, certificates, and mailing list subscriptions. It is based on the approved "Min profil" mockup.

## Route Protection

- **URL**: `/[clubSlug]/profil`
- **Guard**: `requireActiveMemberForClub(clubId, clubSlug)`
- **Access Rule**: Requires an authenticated user with an `ACTIVE` membership in the specified club.

## Components

The profile page is built using several specialized components located in `src/components/member/`:

- **MemberProfile**: The main container component that orchestrates the layout.
- **ProfileHero**: Displays the profile eyebrow, title, and action pill placeholders.
- **ProfileSummaryCard**: Shows the member's avatar (initials placeholder), name, roles, and status.
- **ProfileDetailsPanel**: Displays personal information (name, email) in a form layout.
- **ProfileCertificatesPanel**: Displays certificate status placeholders.
- **ProfileMailingListsPanel**: Displays mailing list subscription placeholders.

## Visual Style

- **Theme**: Uses the `ThemedClubPageShell` and follows the dark premium club-platform theme.
- **Tokens**: Uses `--club-*` CSS variables defined in the club's theme.
- **Layout**: 
  - Desktop: Two-column layout (0.8fr / 1.2fr).
  - Mobile: Stacks vertically.
- **UI Elements**: Glassmorphism cards, dark themed inputs, and custom pills matching the mockup.

## Data Sources

- **Viewer Identity**: Real name and email from Auth.js session.
- **Membership**: Real club role and membership status from the database.
- **Placeholder Content**: Profile picture, address, certificates, and mailing lists are currently placeholders.

## V1 Scope Limitations

The following features are visual placeholders only and are NOT implemented in V1:
- Profile editing and persistence.
- Profile image upload.
- Password change (uses magic link login).
- Real-time mailing list synchronization.
- Real-time certificate verification or updates.
- Printing of membership cards.

## Future Integration

- **Mailing Lists**: Future integration must use tenant-scoped configuration.
- **Persistence**: Server actions will be added to handle profile updates once the data model is ready.
- **Uploads**: Image storage and upload handlers will be implemented in a future phase.
