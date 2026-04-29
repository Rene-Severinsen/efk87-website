# Member Card Print Page

This document describes the implementation of the member card print page (`/[clubSlug]/profil/medlemskort`).

## Overview

The member card print page allows logged-in members to generate and print a physical cut-out member card that matches the legacy EFK87 design.

## Route

- **URL**: `/[clubSlug]/profil/medlemskort`
- **Guard**: `requireActiveMemberForClub(clubId, clubSlug)`
- **Access**: Only authenticated active members can view/print their own card.

## Implementation Details

### Card Dimensions
The printable card uses exact physical dimensions:
- **Width**: 85.6mm
- **Height**: 54mm
- **Border**: 1px solid black (acts as the cut line)

### Card Status Logic
The card's visual type (indicated by a colored left border) is determined by member data:
- **Passiv kort** (Grey border): Member has `membershipType === 'PASSIVE'`.
- **Plads godkendt kort** (Green border): Member has `schoolStatus === 'APPROVED'`.
- **Elev kort** (Yellow border): Member has `schoolStatus === 'STUDENT'`.
- **Fallback**: No specific colored border.

### Components
- `PrintableMemberCard`: The physical card with name, year, and logo.
- `MemberCardInstructions`: Instructions for printing and assembly.
- `MemberCardReference`: Section showing a reference of the finished card.
- `MemberCardTypeLegend`: Explanation of the different card types.

### Print Behavior
The page uses `@media print` rules to:
- Hide navigation, topbar, and footer.
- Hide "Print" buttons and other UI chrome.
- Ensure exact physical sizing of the card.
- Use a white background and black text for optimal printing.

## Assets
- **Logo**: Currently uses a text placeholder. Should be replaced with `EFK87` logo asset when available.
- **Reference Image**: Currently uses a placeholder. Should be replaced with the legacy reference image.
