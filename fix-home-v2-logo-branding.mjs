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

patchFile("src/app/[clubSlug]/page.tsx", (current) => {
    let next = current;

    if (!next.includes("logoUrl: true")) {
        next = next.replace(
            "publicThemeMode: true,",
            `publicThemeMode: true,
          logoUrl: true,
          logoAltText: true,
          faviconUrl: true,
          appleIconUrl: true,`,
        );
    }

    return next;
});

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

    // Replace common badge block: initials/avatar + brand text
    next = next.replace(
        /<div className="home-v2-brand-mark"[^>]*>[\s\S]*?<\/div>\s*<div className="home-v2-brand-copy">[\s\S]*?<\/div>/,
        `{homeLogoUrl ? (
              <img
                src={homeLogoUrl}
                alt={homeLogoAltText}
                className="home-v2-brand-logo"
              />
            ) : (
              <div className="home-v2-brand-mark" aria-hidden="true">
                {club.settings?.shortName || club.name}
              </div>
            )}

            <div className="home-v2-brand-copy">
              <strong>{club.settings?.shortName || club.name}</strong>
              <span>KLUBSITE</span>
            </div>`,
    );

    // More defensive: if only brand-mark exists, replace it with logo/fallback block
    next = next.replace(
        /<div className="home-v2-brand-mark" aria-hidden="true">[\s\S]*?<\/div>/,
        `{homeLogoUrl ? (
              <img
                src={homeLogoUrl}
                alt={homeLogoAltText}
                className="home-v2-brand-logo"
              />
            ) : (
              <div className="home-v2-brand-mark" aria-hidden="true">
                {club.settings?.shortName || club.name}
              </div>
            )}`,
    );

    return next;
});

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.css", (current) => {
    let next = current;

    const css = `
/* Homepage branding logo */
.home-v2-brand-logo {
  display: block;
  width: auto;
  height: 4.25rem;
  max-width: 13rem;
  object-fit: contain;
  flex-shrink: 0;
}

.home-v2-brand {
  align-items: center;
}

.home-v2-brand-copy strong {
  font-size: 1.15rem;
}

@media (max-width: 900px) {
  .home-v2-brand-logo {
    height: 3.25rem;
    max-width: 10rem;
  }
}

@media (max-width: 640px) {
  .home-v2-brand-logo {
    height: 2.75rem;
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