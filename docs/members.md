# Member Profiles

This document describes the member profile system for EFK87.

## Models

We have separated access/authorization from profile data:

1.  **ClubMembership**: Controls system access (ACTIVE, PENDING, etc.) and system roles (MEMBER, ADMIN, OWNER).
2.  **ClubMemberProfile**: Stores member stamdata (name, address, contact, club-specific roles, etc.).
3.  **ClubMemberCertificate**: Stores member certificates (A-certifikat, S-kontrollant, etc.).

## Tenancy & Privacy

- All member data is tenant-scoped by `clubId`.
- Normal members can only see their own profile data.
- Admins can see and edit all member profiles within their club.
- Private data (address, phone, email, MDK number, admin-only status) is never exposed to public visitors.

## Club Roles vs System Roles

- **System Roles (`ClubMembership.role`)**: Controls technical access to the platform (e.g., who can access `/admin`).
- **Club Roles (`ClubMemberProfile.memberRoleType`)**: Describes the member's function within the club (e.g., Chairman, Treasurer). These do not grant technical permissions on their own.

## Certificates

Certificates are stored in a normalized `ClubMemberCertificate` model. They are managed by administrators on the member edit page.

## Profile Images

Currently, profile images are stored as URLs in the `profileImageUrl` field. Direct image upload is planned for a future phase.
