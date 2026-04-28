# Theme Foundation

The theme system provides tenant-scoped visual settings for clubs.

## ClubTheme Model

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
- `heroImageUrl`: Optional override for the main hero image

## Application

Themes are applied to the public homepage through CSS variables. The `PublicClubHomePage` component maps `ClubTheme` fields to the following CSS variables on its root element:

- `--club-bg`
- `--club-panel`
- `--club-panel-soft`
- `--club-line`
- `--club-text`
- `--club-muted`
- `--club-accent`
- `--club-accent-2`
- `--club-shadow`
- `--club-radius`

If no theme is found for a club, the component falls back to the default values defined in `PublicClubHomePage.css`.

## Management

- **Seeding**: Initial theme values for clubs (like EFK87) are managed through `prisma/seed.ts`.
- **Admin Editing**: Not yet implemented. Future admin UI will expose safe editing of these values.
- **Service**: `publicThemeService.ts` handles theme data fetching. Route pages must use this service instead of querying Prisma directly.

## Constraints

- **Layout Integrity**: Theme settings must only control visual styling (colors, radius, shadows, etc.) and must not be used to redesign the layout or change section order.
- **Locked Reference**: The approved EFK87 mockup remains the primary visual reference for the theme implementation.
