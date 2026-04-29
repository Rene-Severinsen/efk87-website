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
- **Automatic Assignment**: For new members, the system follows a max+1 logic (see `getNextMemberNumber` in `memberNumberService.ts`).
- **Read-only**: Once assigned, the `memberNumber` is system-managed and cannot be edited by administrators or members.
- **Legacy Preservation**: When importing members from legacy systems, their existing `memberNumber` must be preserved.
- **Separate from MDK**: This field is NOT the same as the MDK number and both can exist simultaneously.

## Onboarding (Admin Create Member)

Administrators can create new members manually:
- **Status**: All new members start with `memberStatus = NEW`.
- **Certificates/Instructor**: These fields are not set during initial creation and must be updated after the member is active.
- **Automatic Medlemsnummer**: Assigned automatically at save time using the max+1 logic.
- **MDK Number Validation**: For new members, `mdkNumber` is required if `membershipType` is `SENIOR` or `JUNIOR`. It is optional for `PASSIVE`.
- **User Creation**: If a user with the given email doesn't exist, a new User account is created. If they already exist, they are linked to the new membership and profile.

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

## New Member Highlights (Homepage)

The homepage features a "Nye medlemmer" card to welcome recent additions to the club.
- **Criteria**: Members who joined within the last 14 days (`joinedAt`).
- **Exclusion**: Members with status `RESIGNED` are excluded.
- **Status NEW**: The `memberStatus = NEW` is NOT used for this highlight; it is strictly based on `joinedAt`.
- **Privacy**: Only display name and joined date are shown publicly.
- **Logo**: A logo placeholder is prepared for future media integration.
