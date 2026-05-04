import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "src/lib/branding/clubBrandingMetadata.ts",
);

if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

const content = `
import type { Metadata } from "next";
import prisma from "../db/prisma";

function withVersion(url: string | null | undefined, version: Date | null | undefined): string | null {
  if (!url) return null;

  const separator = url.includes("?") ? "&" : "?";
  const value = version ? version.getTime() : Date.now();

  return \`\${url}\${separator}v=\${value}\`;
}

export async function getClubBrandingMetadata(clubSlug: string): Promise<Metadata> {
  const club = await prisma.club.findUnique({
    where: {
      slug: clubSlug,
    },
    select: {
      settings: {
        select: {
          faviconUrl: true,
          appleIconUrl: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!club?.settings) {
    return {};
  }

  const faviconUrl = withVersion(club.settings.faviconUrl, club.settings.updatedAt);
  const appleIconUrl = withVersion(club.settings.appleIconUrl, club.settings.updatedAt);

  const icons: NonNullable<Metadata["icons"]> = {};

  if (faviconUrl) {
    icons.icon = [
      {
        url: faviconUrl,
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: faviconUrl,
        type: "image/png",
        sizes: "48x48",
      },
    ];
    icons.shortcut = faviconUrl;
  }

  if (appleIconUrl) {
    icons.apple = [
      {
        url: appleIconUrl,
        type: "image/png",
        sizes: "180x180",
      },
    ];
  }

  return {
    icons,
  };
}
`;

fs.writeFileSync(filePath, content.trimStart(), "utf8");

console.log("Patched src/lib/branding/clubBrandingMetadata.ts");
console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");
