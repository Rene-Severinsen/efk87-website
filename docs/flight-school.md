# Flyveskole (Flight School)

The Flyveskole module provides a CMS for managing flight school information, student documents, and displaying instructors.

## Admin Maintenance

Admin access to Flyveskole is available under **Admin → Flyveskole**. The interface is divided into two main sections:

### Sideindhold (Page Content)
- Manages the main landing page for the flight school.
- Fields: Title, Intro, and a Rich Text content area.
- Status: Can be set to "Udgivet" (Published) or "Kladde" (Draft).

### Elevdokumenter (Student Documents)
- Manages specific documents/pages for students.
- Documents are **readable CMS pages**, not file uploads or PDFs.
- Features:
  - Title and automatic/custom Slug generation.
  - Sort order (manual numeric sorting).
  - Rich Text editor for content.
  - Slug normalization ensures URL-friendly paths.
  - Duplicate slugs are prevented per club.

## Instructors

Instructors are displayed in a read-only panel in the Flyveskole admin.
- **Management:** Instructors are NOT managed directly in the Flyveskole module.
- **Control:** They are controlled through **Admin → Medlemmer**.
- **Requirement:** A member must have the "Instruktør" flag enabled in their profile and have an "ACTIVE" member status to appear in the list.

## Public Pages

The flight school content is available on the public site under the following routes:

- **Main page:** `/[clubSlug]/flyveskole`
  - Displays the published `FlightSchoolPage` content.
  - Lists active instructors with contact information.
  - Links to all published `FlightSchoolDocument` pages.
- **Document page:** `/[clubSlug]/flyveskole/[documentSlug]`
  - Displays a specific published document.
  - Optimized for readability with specific print support.

## Print Support

Document pages include a "Print dokument" button and specialized print CSS:
- Navigation, headers, and footers are hidden when printing.
- Content is rendered on a white background with black text.
- Typography is optimized for physical output.
- Headings, lists, and links are preserved for clarity.

## Architecture

- **Models:** `FlightSchoolPage` and `FlightSchoolDocument`.
- **Services:** 
  - `src/lib/flightSchool/flightSchoolService.ts` (Public read)
  - `src/lib/admin/flightSchoolAdminService.ts` (Admin read/write)
- **Actions:** `src/lib/admin/flightSchoolActions.ts` (Server actions for admin)
- **Slug Helper:** `src/lib/slug/normalizeSlug.ts` (Shared normalization logic)

## Future Considerations

- **Expansion:** The structure is designed to later include student progression, logbooks, and scheduling without renaming the current CMS feature.
