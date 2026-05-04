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

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.tsx", (current) => {
  let next = current;

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

  if (!next.includes("const homeLogoUrl =")) {
    const functionStart = next.indexOf("export default function PublicClubHomePageV2");
    const bodyStart = next.indexOf("{", next.indexOf(")", functionStart));

    if (functionStart === -1 || bodyStart === -1) {
      console.error("Could not find PublicClubHomePageV2 function body.");
      process.exit(1);
    }

    next =
      next.slice(0, bodyStart + 1) +
      `
  const homeLogoUrl = club.settings?.logoUrl ?? null;
  const homeLogoAltText =
    club.settings?.logoAltText || club.settings?.displayName || club.name;
` +
      next.slice(bodyStart + 1);
  }

  const brandLinkRegex =
    /<Link\b(?=[\s\S]*?className="home-v2-brand")[\s\S]*?<\/Link>/;

  const replacement = `<Link href={\`/\${club.slug}\`} className="home-v2-brand" aria-label={homeLogoAltText}>
            {homeLogoUrl ? (
              <img
                src={homeLogoUrl}
                alt={homeLogoAltText}
                className="home-v2-brand-logo"
              />
            ) : null}

            <div className="home-v2-brand-copy">
              <strong>{club.settings?.shortName || club.name}</strong>
              <span>KLUBSITE</span>
            </div>
          </Link>`;

  if (!brandLinkRegex.test(next)) {
    console.error("Could not find <Link className=\"home-v2-brand\"> block.");
    console.error("Search for home-v2-brand in PublicClubHomePageV2.tsx and send that block if this fails.");
    process.exit(1);
  }

  next = next.replace(brandLinkRegex, replacement);

  return next;
});

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.css", (current) => {
  let next = current;

  const css = `
/* Forced homepage logo branding */
.home-v2-brand {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  text-decoration: none;
}

.home-v2-brand-logo {
  display: block;
  width: auto;
  height: 4.6rem;
  max-width: 15rem;
  object-fit: contain;
  flex-shrink: 0;
}

.home-v2-brand-mark,
.home-v2-brand-badge,
.home-v2-brand-avatar {
  display: none;
}

.home-v2-brand-copy {
  display: grid;
  gap: 0.05rem;
  min-width: 0;
}

.home-v2-brand-copy strong {
  color: var(--home-text);
  font-size: 1.2rem;
  font-weight: 850;
  line-height: 1;
}

.home-v2-brand-copy span {
  color: var(--home-muted);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .home-v2-brand-logo {
    height: 3.5rem;
    max-width: 11rem;
  }
}

@media (max-width: 640px) {
  .home-v2-brand-logo {
    height: 2.8rem;
    max-width: 8rem;
  }

  .home-v2-brand-copy strong {
    font-size: 1rem;
  }

  .home-v2-brand-copy span {
    font-size: 0.58rem;
  }
}
`;

  if (next.includes("/* Forced homepage logo branding */")) {
    next = next.replace(
      /\/\* Forced homepage logo branding \*\/[\s\S]*$/,
      css.trimStart(),
    );
  } else {
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
