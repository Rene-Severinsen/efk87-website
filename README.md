This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- BEGIN:docs-sync-2026-05-04-om-media-gallery:current-project-status -->

## Current Project Status — EFK87 Platform

The project is now a tenant-scoped club website/platform with EFK87 as the first club tenant.

Recently completed major modules:

- Om-modul: landing page and subpages for members, membership, board, economy, rules, location/contact and statistics.
- Media Library: admin image upload/normalization foundation with reusable Media picker.
- Gallery: member-created galleries with multi-upload, cover selection, lightbox, member visibility and admin maintenance.

Core checks before committing changes:

npm run check:public-theme
npx tsc --noEmit
npm run build

Important development rules:

- Public/member UI must use Light Premium Solid Contrast tokens and pass check:public-theme.
- Admin UI is separate and still dark/admin-first.
- Tenant scope must use clubId/club slug and must not hardcode EFK87 except in seed/test data.
- File/image upload is local V1 storage, but services are centralized for future Object Storage.

<!-- END:docs-sync-2026-05-04-om-media-gallery:current-project-status -->

