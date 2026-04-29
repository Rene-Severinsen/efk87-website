# Gallery Foundation

The gallery is a multi-tenant foundation for managing and displaying photos and albums within the EFK87 platform.

## Architecture

- **Tenant-scoped**: All gallery data is strictly scoped by `clubId`.
- **Read-only**: Currently, both public and admin interfaces are read-only. Upload, moderation, and editor UIs are planned for future phases.
- **Legacy Ready**: The data model includes `legacySource` and `legacyId` to support future imports from the old EFK87 site while preventing duplicates.

## Data Model

### GalleryAlbum
- Represents a collection of images.
- Fields: `slug`, `title`, `description`, `coverImageUrl`, `status`, `visibility`, `sortOrder`, `legacySource`, `legacyId`.
- Unique constraint on `clubId` + `slug`.

### GalleryImage
- Represents an individual photo.
- Fields: `albumId`, `title`, `caption`, `imageUrl`, `thumbnailUrl`, `status`, `sortOrder`, `legacySource`, `legacyId`.

## Visibility & Status

- **GalleryAlbumStatus**: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- **GalleryImageStatus**: `ACTIVE`, `HIDDEN`, `ARCHIVED`.
- **PublicSurfaceVisibility**: `PUBLIC`, `MEMBERS_ONLY`.

Public visitors can only see `PUBLISHED` albums with `PUBLIC` visibility.
Authenticated members can also see `MEMBERS_ONLY` albums.

## Services

- `galleryService.ts`: Public-facing data fetching with visibility filtering.
- `galleryAdminService.ts`: Admin-facing data fetching for overview and management.

## Future Work

- [ ] File upload and image processing pipeline.
- [ ] Image storage integration (e.g., S3/R2).
- [ ] Album editor and image management UI.
- [ ] Moderation tools.
- [ ] Legacy import script for EFK87.
