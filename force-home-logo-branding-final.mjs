import fs from "fs";
import path from "path";

const root = process.cwd();

function patchFile(relativePath, patcher) {
    const absolutePath = path.join(root, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`Skipped ${relativePath} — file not found`);
        return;
    }

    const current = fs.readFileSync(absolutePath, "utf8");
    const next = patcher(current);

    if (next === current) {
        console.log(`No change ${relativePath}`);
        return;
    }

    fs.writeFileSync(absolutePath, next, "utf8");
    console.log(`Patched ${relativePath}`);
}

function addSettingsFields(content) {
    const requiredFields = [
        "logoUrl: true,",
        "logoAltText: true,",
        "faviconUrl: true,",
        "appleIconUrl: true,",
    ];

    let next = content;

    for (const field of requiredFields) {
        if (!next.includes(field)) {
            next = next.replace(
                "publicThemeMode: true,",
                `publicThemeMode: true,
          ${field}`,
            );
        }
    }

    return next;
}

patchFile("src/app/[clubSlug]/page.tsx", addSettingsFields);
patchFile("src/lib/publicSite/publicClubSettingsService.ts", addSettingsFields);
patchFile("src/lib/publicSite/publicPageRoute.ts", addSettingsFields);

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.tsx", (current) => {
    let next = current;

    if (!next.includes("const homeLogoUrl =")) {
        const functionStart = next.indexOf("export default function PublicClubHomePageV2");
        const bodyStart = next.indexOf("{", next.indexOf(")", functionStart));

        if (functionStart !== -1 && bodyStart !== -1) {
            next =
                next.slice(0, bodyStart + 1) +
                `
  const homeLogoUrl = club.settings?.logoUrl ?? null;
  const homeLogoAltText =
    club.settings?.logoAltText || club.settings?.displayName || club.name;
` +
                next.slice(bodyStart + 1);
        }
    }

    // Remove old badge/fallback completely when logo is missing.
    next = next.replace(
        /<div className="home-v2-brand-mark"[^>]*>[\s\S]*?<\/div>/g,
        `{homeLogoUrl ? (
              <img
                src={homeLogoUrl}
                alt={homeLogoAltText}
                className="home-v2-brand-logo"
              />
            ) : null}`,
    );

    // Ensure brand copy remains normal and not duplicated.
    next = next.replaceAll(
        `{homeLogoUrl ? (
              <img
                src={homeLogoUrl}
                alt={homeLogoAltText}
                className="home-v2-brand-logo"
              />
            ) : null}
            )}`,
        `{homeLogoUrl ? (
              <img
                src={homeLogoUrl}
                alt={homeLogoAltText}
                className="home-v2-brand-logo"
              />
            ) : null}`,
    );

    // Extend manual type if needed.
    if (!next.includes("logoUrl: string | null;")) {
        next = next.replace(
            "publicThemeMode: string;",
            `publicThemeMode: string;
      logoUrl: string | null;
      logoAltText: string | null;
      faviconUrl?: string | null;
      appleIconUrl?: string | null;`,
        );
    }

    return next;
});

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.css", (current) => {
    let next = current;

    const css = `
/* Homepage branding logo */
.home-v2-brand-logo {
  display: block;
  width: auto;
  height: 4.4rem;
  max-width: 14rem;
  object-fit: contain;
  flex-shrink: 0;
}

.home-v2-brand {
  align-items: center;
  gap: 1rem;
}

.home-v2-brand-copy strong {
  font-size: 1.2rem;
}

@media (max-width: 900px) {
  .home-v2-brand-logo {
    height: 3.3rem;
    max-width: 10rem;
  }
}

@media (max-width: 640px) {
  .home-v2-brand-logo {
    height: 2.8rem;
    max-width: 8rem;
  }
}
`;

    if (!next.includes("/* Homepage branding logo */")) {
        next = `${next.trimEnd()}\n\n${css.trimStart()}`;
    }

    return next;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");