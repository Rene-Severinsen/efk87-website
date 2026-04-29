# Article Foundation

This document describes the implementation of the article foundation for the EFK87 website.

## Overview

Articles are tenant-scoped content pieces that can be published on the club's website. They support a draft/published/archived workflow and can be categorized and tagged.

## Data Model

The article foundation consists of the following Prisma models:

- `Article`: The main content model.
- `ArticleCategory`: Hierarchical (sortable) categories for articles.
- `ArticleTag`: Flat tags for articles.
- `ArticleTagAssignment`: Many-to-many join model between articles and tags.

### Tenancy

All models are scoped by `clubId`. Every query and write operation must ensure that the `clubId` is correctly applied.

## Workflow

1. **DRAFT**: The article is only visible to admins.
2. **PUBLISHED**: The article is visible on the public site (subject to visibility settings).
3. **ARCHIVED**: The article is no longer visible on the public site but preserved in the database.

## Visibility

- **PUBLIC**: Visible to everyone.
- **MEMBERS_ONLY**: Visible only to authenticated members of the club.

## Implementation Details

- **Services**: Located in `src/lib/articles/` (public) and `src/lib/admin/` (admin).
- **Actions**: Located in `src/lib/admin/articleActions.ts`.
- **Public UI**: Ported from the approved dark premium design mockup.
- **Admin UI**: Integrated into the existing admin shell using the standard admin design language.

## Future Scopes

- Rich-text editor (currently plain text/markdown-ish).
- Image upload and storage (currently heroImageUrl text field).
- Legacy import scripts.
- Comments.
