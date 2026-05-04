# Theme & Design Implementation Guide

This guide defines the strict rules for implementing and maintaining the public and member-facing UI themes. 

## Non-Negotiable Rules

### 1. Default Theme
- **Light Premium Solid Contrast** is the default theme for all public and member pages.
- Dark mode and any future theme variants (e.g., high contrast) are **optional variants** and must be implemented using the established token system.

### 2. Admin UI Separation
- **Admin files are handled separately.** This guide applies only to `public` and `member` scopes. Do not apply these rules to admin-specific components unless they are explicitly shared.

### 3. Accepted Token Families
All colors and visual styles must use one of the following CSS variable families:
- `--public-*`: Generic tokens for all public and member pages (defined in `globals.css`).
- `--home-*`: Tokens specifically scoped for the Homepage V2 implementation.

### 4. Semantic UI Classes
New public/member UI must use these semantic classes instead of utility-first color strings:
- `public-page-shell`: Main page wrapper background and text color.
- `public-label`: Form labels.
- `public-input`: Standard form inputs.
- `public-primary-button`: Main action buttons.
- `public-secondary-button`: Secondary action buttons.
- `public-link`: Standard text links.
- `public-alert`: Base alert style.
- `public-alert-info`: Informational alerts.
- `public-alert-success`: Success alerts.
- `public-alert-warning`: Warning alerts.
- `public-alert-danger`: Error/Danger alerts.

### 5. Prohibited Hardcoded Colors
Hardcoded Tailwind color families and hex values are **not allowed** in public/member UI unless intentionally scoped and documented:
- `text-white`
- `bg-white/*`
- `border-white/*`
- `slate-*`, `sky-*`, `blue-*`, `emerald-*`, `amber-*`, `red-*`
- Hardcoded hex values

### 6. Allowed Exceptions
- **Print Styles**: `print:text-black` and `print:bg-white` are permitted.
- **Intentional Visuals**: SVG/icon strokes or fills may use fixed colors only when visually intentional and documented.
- **Text on Primary**: Must use `--public-text-on-primary` or `--home-text-on-primary`.

---

## ClubTheme Model (Tenant Scoping)

The `ClubTheme` model stores visual settings for a specific club:

- `backgroundColor`: Main background color
- `panelColor`: Background color for cards and panels
- `panelSoftColor`: Subtle background color for secondary elements
- `lineColor`: Border and divider color
- `textColor`: Primary text color
- `mutedTextColor`: Secondary/muted text color
- `accentColor`: Primary brand/accent color
- `accentColor2`: Secondary accent color (e.g. for gradients)
- `shadowValue`: CSS box-shadow value
- `radiusValue`: CSS border-radius value

Themes are applied to the public homepage through `--club-*` CSS variables, which are then mapped to the semantic tokens.

## Developer Checklist for Theme Tasks

Follow this order of operations:

1. [ ] **Use existing shared CSS classes first** (e.g., `.public-input`, `.public-primary-button`).
2. [ ] **Use public tokens second** (e.g., `var(--public-text-muted)`).
3. [ ] **Do not invent new tokens** unless explicitly requested.
4. [ ] **Do not redesign** or change current CSS tokens.
5. [ ] **Search for hardcoded color leftovers** in changed files before submitting.
6. [ ] **Verify** by running `npx tsc --noEmit` and `npm run build`.
