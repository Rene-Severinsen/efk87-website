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
