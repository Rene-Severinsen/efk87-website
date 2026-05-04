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
