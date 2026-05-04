# Responsive Design Guidelines

This document outlines the responsive design foundation and rules for the EFK87 platform public and member-facing pages.

## Strategic Decision
The platform must support both desktop and mobile properly. Many members use the website daily on mobile. All public/member-facing features must be designed and verified for both platforms.

## Hard Rules
- Public/member pages must be responsive by default.
- Desktop and mobile layouts must both be intentional.
- Do not build desktop-only public pages.
- Mobile must be touch-friendly and readable.
- No horizontal page scroll at 375px width.

## Breakpoints
We use a standardized set of breakpoints for all public/member pages:

1. **Mobile Breakpoint**:
   - Under **768px**
   - Single-column layout by default.
   - Cards stack vertically.
   - Grids become one column.
   - Navigation collapses into a mobile menu.

2. **Tablet Breakpoint**:
   - **768px to 1100px**
   - One or two columns depending on content.
   - Hero areas and cards scale gracefully.

3. **Desktop Breakpoint**:
   - Over **1100px**
   - Full premium portal layout.
   - Grid layouts can use full width (up to 1440px shell).

## UX Requirements
- **Touch Targets**: Minimum tap target roughly 44px height for buttons and links.
- **Font Sizes**: Avoid body text below 13px. Use `clamp()` or media queries for responsive headings.
- **Padding**: Ensure comfortable padding (min 12px-16px) on mobile viewports.
- **Images**: Use `max-width: 100%; height: auto;` to prevent overflow.
- **Overflow**: Long words or URLs must wrap safely (`word-break: break-word`).
- **Tables**: Tables must not break the viewport. Use horizontal scroll containers or stackable card patterns on mobile.

## Shared Components
- **ThemedTopBar**: Automatically handles mobile menu toggle below 768px.
- **ThemedClubPageShell**: Provides a responsive container with appropriate padding.
- **ThemedPageHeader**: Headings scale automatically using `clamp()`.

## Implementation Approach
- Use existing CSS classes from `PublicClubHomePageV2.css` where possible.
- Prefer Tailwind's responsive utilities for new components.
- Avoid per-page hacks; use shared responsive patterns.
- Always verify at:
  - 390px (Small Mobile)
  - 768px (Tablet)
  - 1440px (Desktop)

<!-- BEGIN:docs-sync-2026-05-04-om-media-gallery:gallery-responsive -->

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

<!-- END:docs-sync-2026-05-04-om-media-gallery:gallery-responsive -->

