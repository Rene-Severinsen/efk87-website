import fs from "fs";
import path from "path";

const root = process.cwd();
const marker = "docs-sync-2026-05-04-om-media-gallery";

function writeFile(relativePath, content) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

function appendOrReplaceSection(relativePath, title, content) {
    const filePath = path.join(root, relativePath);

    if (!fs.existsSync(filePath)) {
        console.warn(`Skipped ${relativePath} — file not found`);
        return;
    }

    const current = fs.readFileSync(filePath, "utf8");
    const begin = `<!-- BEGIN:${marker}:${title} -->`;
    const end = `<!-- END:${marker}:${title} -->`;

    const section = `
${begin}

${content.trim()}

${end}
`;

    const beginIndex = current.indexOf(begin);
    const endIndex = current.indexOf(end);

    if (beginIndex !== -1 && endIndex !== -1) {
        const next = `${current.slice(0, beginIndex)}${section}${current.slice(endIndex + end.length)}`;
        fs.writeFileSync(filePath, next.trimEnd() + "\n", "utf8");
        console.log(`Updated ${relativePath} :: ${title}`);
        return;
    }

    fs.writeFileSync(filePath, `${current.trimEnd()}\n\n${section.trimStart()}\n`, "utf8");
    console.log(`Appended ${relativePath} :: ${title}`);
}

writeFile("docs/media-library.md", `
# Media Library

Media Library is the shared image foundation for admin-managed public content.

## Purpose

Media Library is used for images that belong to club website, CMS and admin-managed content.

Examples:

- Her bor vi images
- Regler og bestemmelser fly zone image
- Article hero images
- Future CMS/public page images

Gallery images are not stored as Media Library assets. Gallery images are member-generated content and are stored on GalleryImage.

## Routes

Admin route:

- /[clubSlug]/admin/media

Upload route:

- /[clubSlug]/admin/media/upload

## Current Features

- Upload image
- Compact thumbnail grid
- Click-to-preview detail view
- Copy public URL
- Open image
- Soft remove/deactivate asset
- Reusable Media picker for admin image fields

## Upload Pipeline

Media upload uses a route handler rather than Server Actions, because file upload through Server Actions is less stable for larger images.

Service:

- src/lib/media/mediaStorageService.ts

Picker component:

- src/components/admin/media/MediaUrlPicker.tsx

## Accepted Input Formats

- JPEG/JPG
- PNG
- WebP
- HEIC
- HEIF

## Output Normalization

All uploaded images are normalized server-side using sharp.

Current V1.1 settings:

- Output format: WebP
- Max longest edge: 2400 px
- Quality: 85
- Max upload size: 25 MB

## Local Storage

Current V1 storage is local:

/public/uploads/{clubSlug}/media

Current storage provider:

LOCAL

## URL Validation

Admin image URL validation must accept:

- https URLs
- http URLs
- local /uploads/... URLs

Example local Media Library URL:

/uploads/efk87/media/example.webp

## Current Consumers

Media picker is currently used by:

- Her bor vi admin form
- Regler og bestemmelser admin form
- Article hero image admin form

## Future Scope

- Move from local storage to S3/Object Storage
- Add crop/focal point support
- Store image dimensions
- Add stronger deletion/lifecycle handling
- Keep profile photos separate from Media Library
`);

writeFile("docs/gallery.md", `
# Gallery

The gallery module supports public and member-only photo albums for the club.

Gallery images are member-generated content. They are stored in gallery-specific records and are not mixed with Media Library assets.

## Current Status

Galleri V1 is implemented and closed.

Implemented:

- Public gallery overview
- Public gallery detail page
- Member-created galleries
- Public/member-only visibility
- Multi-image upload
- Drag/drop upload
- HEIC/HEIF/JPG/PNG/WebP input support
- WebP normalization through sharp
- Cover image selection during gallery creation
- Members can add images to existing galleries
- Lightbox with next/previous navigation
- Admin gallery overview
- Admin gallery detail/edit
- Admin cover image selection
- Admin hide/show image
- Admin archive/delete gallery with confirmation
- Homepage toggle between latest images and latest updated galleries
- Seed gallery data removed

## Routes

Public/member routes:

- /[clubSlug]/galleri
- /[clubSlug]/galleri/[albumSlug]
- /[clubSlug]/galleri/nyt

Upload routes:

- /[clubSlug]/galleri/nyt/upload
- /[clubSlug]/galleri/[albumSlug]/upload

Admin routes:

- /[clubSlug]/admin/galleri
- /[clubSlug]/admin/galleri/[albumId]

## Visibility

Gallery albums use PublicSurfaceVisibility:

- PUBLIC
- MEMBERS_ONLY

Anonymous visitors can only see public albums.

Logged-in club members can see both public and member-only albums.

Members choose visibility when creating a gallery:

- Offentligt
- Kun for medlemmer

## Publishing Rule

Member-created galleries are published immediately.

There is no approval or pending-review flow.

## Status

Gallery albums use:

- DRAFT
- PUBLISHED
- ARCHIVED

Gallery images use:

- ACTIVE
- HIDDEN
- ARCHIVED

Admin can hide an image and make it visible again.

Admin can archive a gallery. This is a soft delete:

- Removed from public/member gallery views
- Still visible in admin
- Data is not permanently deleted

## Data Model

GalleryAlbum key fields:

- clubId
- slug
- title
- description
- coverImageUrl
- status
- visibility
- createdByMemberProfileId
- createdByName
- createdByEmail
- legacySource
- legacyId

GalleryImage key fields:

- clubId
- albumId
- imageUrl
- thumbnailUrl
- status
- sortOrder
- originalName
- fileName
- mimeType
- sizeBytes
- storageProvider
- storageKey
- uploadedByMemberProfileId
- uploadedByName
- uploadedByEmail
- legacySource
- legacyId

## Upload Pipeline

Gallery image storage service:

- src/lib/gallery/galleryImageStorageService.ts

Member gallery service:

- src/lib/gallery/galleryMemberService.ts

Accepted input formats:

- JPEG/JPG
- PNG
- WebP
- HEIC
- HEIF

Normalized output:

- WebP
- max longest edge: 2400 px
- quality: 85
- max upload size: 25 MB
- max images per upload: 40

Storage path:

/public/uploads/{clubSlug}/gallery/{albumId}

## Member Identity

Gallery display names must use the club member profile as source of truth:

- ClubMemberProfile.firstName
- ClubMemberProfile.lastName

Do not rely on User.name, because local/dev seed users may still have generic names such as Test Member.

Helper:

- src/lib/members/memberProfileIdentityService.ts

## Public UI

Gallery cards use fixed image aspect ratio so portrait and landscape images display consistently.

Album detail uses:

- src/components/gallery/GalleryLightbox.tsx

Members see an add-images form below the image grid:

- src/components/gallery/GalleryAddImagesForm.tsx

The image grid is the primary content. Upload/add-images is secondary and should remain below the gallery.

## Homepage Integration

Homepage V2 shows a compact gallery preview with a toggle:

- Seneste billeder
- Seneste gallerier

Component:

- src/components/publicSite/homeV2/HomeGalleryToggle.tsx

Service:

- getHomepageGalleryPreview in src/lib/gallery/galleryService.ts

## Admin UI

Admin overview:

- Card-based overview with cover image
- Status chip
- Visibility chip
- Image count
- Updated date
- Created-by info
- Open action
- Archive/delete action with browser confirmation

Admin detail:

- Edit title
- Edit description
- Edit status
- Edit visibility
- Set cover image
- Hide image
- Make hidden image visible again

## Known Limitations

- No permanent hard-delete UI
- No image reorder UI yet
- No per-image captions/titles edit UI yet
- No S3/Object Storage yet
- No moderation/approval flow by design
`);

appendOrReplaceSection("README.md", "current-project-status", `
## Current Project Status — EFK87 Platform

The project is now a tenant-scoped club website/platform with EFK87 as the first club tenant.

Recently completed major modules:

- Om-modul: landing page and subpages for members, membership, board, economy, rules, location/contact and statistics.
- Media Library: admin image upload/normalization foundation with reusable Media picker.
- Gallery: member-created galleries with multi-upload, cover selection, lightbox, member visibility and admin maintenance.

Core checks before committing changes:

npm run check:public-theme
npx tsc --noEmit
npm run build

Important development rules:

- Public/member UI must use Light Premium Solid Contrast tokens and pass check:public-theme.
- Admin UI is separate and still dark/admin-first.
- Tenant scope must use clubId/club slug and must not hardcode EFK87 except in seed/test data.
- File/image upload is local V1 storage, but services are centralized for future Object Storage.
`);

appendOrReplaceSection("docs/app-structure.md", "media-gallery-structure", `
## Media & Gallery Structure

Media Library:

- src/app/[clubSlug]/admin/media
- src/app/[clubSlug]/admin/media/upload/route.ts
- src/lib/media/mediaStorageService.ts
- src/components/admin/media/MediaUrlPicker.tsx

Gallery:

- src/app/[clubSlug]/galleri
- src/app/[clubSlug]/galleri/nyt
- src/app/[clubSlug]/galleri/nyt/upload/route.ts
- src/app/[clubSlug]/galleri/[albumSlug]
- src/app/[clubSlug]/galleri/[albumSlug]/upload/route.ts
- src/app/[clubSlug]/admin/galleri
- src/app/[clubSlug]/admin/galleri/[albumId]

Shared gallery services/components:

- src/lib/gallery/galleryService.ts
- src/lib/gallery/galleryMemberService.ts
- src/lib/gallery/galleryImageStorageService.ts
- src/components/gallery/GalleryLightbox.tsx
- src/components/gallery/GalleryAddImagesForm.tsx

Homepage integration:

- src/components/publicSite/homeV2/HomeGalleryToggle.tsx
`);

appendOrReplaceSection("docs/admin-implementation.md", "media-gallery-admin", `
## Media Library Admin

Admin Media Library is available at:

- /[clubSlug]/admin/media

It supports:

- image upload
- compact grid
- click-to-preview
- copy public URL
- open image
- soft remove/deactivate

Uploaded files are normalized to WebP through sharp and stored locally under:

/public/uploads/{clubSlug}/media

## Gallery Admin

Admin Gallery is available at:

- /[clubSlug]/admin/galleri
- /[clubSlug]/admin/galleri/[albumId]

Admin can:

- view galleries as cover cards
- see status, visibility, image count and creator
- open/edit gallery
- change title/description/status/visibility
- set cover image
- hide/show images
- archive/delete gallery with confirmation

Gallery archive/delete is a soft delete. It sets the album status to ARCHIVED; it does not permanently delete images or database rows.
`);

appendOrReplaceSection("docs/articles.md", "media-library-article-hero", `
## Article Hero Images

Article hero image fields are now connected to Media Library.

Admin article forms use:

- src/components/admin/media/MediaUrlPicker.tsx

This allows selecting a local Media Library image or entering an external URL.

Supported image URL formats:

- https URLs
- http URLs
- local /uploads/... URLs

Public article overview uses real img rendering for hero images so local /uploads/... assets display correctly.
`);

appendOrReplaceSection("docs/database.md", "media-gallery-models", `
## Media & Gallery Models

ClubMediaAsset is used for admin/CMS image assets.

GalleryAlbum and GalleryImage are used for member-generated gallery content.

Current image storage provider is LOCAL.

Local storage paths:

/public/uploads/{clubSlug}/media
/public/uploads/{clubSlug}/gallery/{albumId}

The storage services are centralized to support future migration to S3/Object Storage.
`);

appendOrReplaceSection("docs/public-site.md", "om-media-gallery-public", `
## Om Module

The Om module currently includes public/member pages for:

- about landing page
- members
- membership
- board
- economy
- rules
- location
- contact
- statistics

Current status: the individual Om blocks/pages are implemented and closed.

## Gallery Public Flow

Public gallery routes:

- /[clubSlug]/galleri
- /[clubSlug]/galleri/[albumSlug]

Members can create galleries at:

- /[clubSlug]/galleri/nyt

Members can add images to existing galleries from the gallery detail page.

The homepage shows gallery activity through a toggle between:

- latest images
- latest updated galleries
`);

appendOrReplaceSection("docs/responsive-design.md", "gallery-responsive", `
## Gallery Responsive Requirements

Gallery pages must remain usable on:

- 390px mobile
- 768px tablet
- 1024px tablet/desktop
- 1440px desktop

Gallery cards and homepage previews must use fixed aspect ratios so portrait and landscape images do not break layout.

Upload forms must support:

- drag/drop on desktop
- multi-select from phone photo albums
- readable selected-file previews
- usable touch targets
`);

appendOrReplaceSection("docs/theme.md", "media-gallery-theme-rules", `
## Media & Gallery Theme Notes

Public/member gallery pages must follow the Light Premium Solid Contrast theme.

Rules:

- Use --public-* tokens.
- Use semantic public classes such as public-input, public-primary-button and public-alert.
- Do not use hardcoded Tailwind color families in public/member gallery components.
- File input button text must use var(--public-primary-contrast), not text-white.

Admin media/gallery pages remain admin-scoped and are not governed by the public theme checker in the same way.
`);

appendOrReplaceSection("docs/visibility.md", "gallery-visibility", `
## Gallery Visibility

Gallery albums use PublicSurfaceVisibility.

Rules:

- PUBLIC: visible to anonymous visitors and members.
- MEMBERS_ONLY: visible only to logged-in members/admins of the club.

Members choose visibility when creating a gallery.

Member-created galleries are published immediately. There is no approval/pending-review state.

Admin can archive galleries. Archived galleries are hidden from public/member views but retained in admin as soft-deleted records.
`);

console.log("");
console.log("Docs sync complete.");
console.log("");
console.log("Recommended check:");
console.log("git diff -- README.md docs");