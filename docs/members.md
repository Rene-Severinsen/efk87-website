# Member Profiles

This document describes the member profile system for EFK87.

## Models

We have separated access/authorization from profile data:

1.  **ClubMembership**: Controls system access (ACTIVE, PENDING, etc.) and system roles (MEMBER, ADMIN, OWNER).
2.  **ClubMemberProfile**: Stores member stamdata (name, address, contact, club-specific roles, etc.).
3.  **ClubMemberCertificate**: Stores member certificates (A-certifikat, S-kontrollant, etc.).
4.  **Medlemsnummer**: Every member has a unique `memberNumber` within their club. This is used as a payment reference and is separate from the MDK number.

## Medlemsnummer (Member Number)

- **Uniqueness**: `memberNumber` is unique per club.
- **Payment Reference**: It is primarily used as a reference for kontingent payments.
- **Sequential Assignment**: For new members, the system follows a max+1 logic (see `getNextMemberNumber` in `memberNumberService.ts`).
- **Legacy Preservation**: When importing members from legacy systems, their existing `memberNumber` must be preserved.
- **Separate from MDK**: This field is NOT the same as the MDK number and both can exist simultaneously.

## Tenancy & Privacy

- All member data is tenant-scoped by `clubId`.
- Normal members can only see their own profile data.
- Admins can see and edit all member profiles within their club.
- Private data (address, phone, email, MDK number, admin-only status) is never exposed to public visitors by default.
- **Instructors**: Members can be marked as "Instruktør" by an admin. This flag controls public visibility on the club's contact page. Only ACTIVE instructors have their contact information (name, image, email, mobile, role) displayed publicly.

## Public Contact Page

The public instructor contact page (`/[clubSlug]/om/kontakt`) displays contact information for members marked as instructors. 
- Only members with `isInstructor = true` and `memberStatus = ACTIVE` are shown.
- Private fields like address, city, birthdate, and MDK number are always hidden.
- If contact info (email/mobile) is missing, the fields are omitted from the card.
- This page is NOT a full member directory and is strictly limited to instructors.

## Club Roles vs System Roles

- **System Roles (`ClubMembership.role`)**: Controls technical access to the platform (e.g., who can access `/admin`).
- **Club Roles (`ClubMemberProfile.memberRoleType`)**: Describes the member's function within the club (e.g., Chairman, Treasurer). These do not grant technical permissions on their own.

## Certificates

Certificates are stored in a normalized `ClubMemberCertificate` model. They are managed by administrators on the member edit page.

## Profile Images

Currently, profile images are stored as URLs in the `profileImageUrl` field. Direct image upload is planned for a future phase.
