import fs from "fs";
import path from "path";

const root = process.cwd();

function patchFile(relativePath, patcher) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    console.warn(`Skipped ${relativePath} — file not found`);
    return false;
  }

  const current = fs.readFileSync(absolutePath, "utf8");
  const next = patcher(current);

  if (next === current) {
    console.log(`No change ${relativePath}`);
    return false;
  }

  fs.writeFileSync(absolutePath, next, "utf8");
  console.log(`Patched ${relativePath}`);
  return true;
}

function findThemedTopBarFile() {
  const candidates = [
    "src/components/publicSite/homeV2/ThemedTopBar.tsx",
    "src/components/publicSite/ThemedTopBar.tsx",
    "src/components/publicSite/homeV2/PublicTopBar.tsx",
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(root, candidate))) {
      return candidate;
    }
  }

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".next" ||
          entry.name === "generated"
        ) {
          continue;
        }

        const found = walk(absolutePath);
        if (found) return found;
      }

      if (entry.isFile() && entry.name.endsWith(".tsx")) {
        const content = fs.readFileSync(absolutePath, "utf8");

        if (
          content.includes("function ThemedTopBar") ||
          content.includes("const ThemedTopBar") ||
          content.includes("export default function ThemedTopBar")
        ) {
          return path.relative(root, absolutePath);
        }
      }
    }

    return null;
  }

  return walk(path.join(root, "src"));
}

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.tsx", (current) => {
  let next = current;

  if (!next.includes("const homeLogoUrl =")) {
    const functionStart = next.indexOf("export default function PublicClubHomePageV2");
    const bodyStart = next.indexOf("{", next.indexOf(")", functionStart));

    if (functionStart === -1 || bodyStart === -1) {
      throw new Error("Could not find PublicClubHomePageV2 function body.");
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

  if (!next.includes("logoUrl={homeLogoUrl}")) {
    next = next.replace(
      `clubDisplayName={clubDisplayName}`,
      `clubDisplayName={clubDisplayName}
          logoUrl={homeLogoUrl}
          logoAltText={homeLogoAltText}`,
    );
  }

  return next;
});

const topBarFile = findThemedTopBarFile();

if (!topBarFile) {
  console.error("Could not find ThemedTopBar file.");
  process.exit(1);
}

console.log(`Using ${topBarFile}`);

patchFile(topBarFile, (current) => {
  let next = current;

  if (!next.includes("logoUrl?: string | null")) {
    next = next.replace(
      `clubDisplayName: string;`,
      `clubDisplayName: string;
  logoUrl?: string | null;
  logoAltText?: string | null;`,
    );
  }

  if (!next.includes("logoUrl,")) {
    next = next.replace(
      `clubDisplayName,`,
      `clubDisplayName,
  logoUrl,
  logoAltText,`,
    );
  }

  next = next.replace(
    /<div className="home-v2-brand-mark"[^>]*>[\s\S]*?<\/div>/,
    `{logoUrl ? (
            <img
              src={logoUrl}
              alt={logoAltText || clubDisplayName || clubName}
              className="home-v2-brand-logo"
            />
          ) : null}`,
  );

  next = next.replace(
    /<div className="themed-club-avatar"[^>]*>[\s\S]*?<\/div>/,
    `{logoUrl ? (
            <img
              src={logoUrl}
              alt={logoAltText || clubDisplayName || clubName}
              className="home-v2-brand-logo"
            />
          ) : null}`,
  );

  next = next.replace(
    /<div className="home-v2-brand-badge"[^>]*>[\s\S]*?<\/div>/,
    `{logoUrl ? (
            <img
              src={logoUrl}
              alt={logoAltText || clubDisplayName || clubName}
              className="home-v2-brand-logo"
            />
          ) : null}`,
  );

  return next;
});

patchFile("src/components/publicSite/homeV2/PublicClubHomePageV2.css", (current) => {
  let next = current;

  const css = `
/* Homepage topbar logo branding */
.home-v2-brand-logo {
  display: block;
  width: auto;
  height: 4.6rem;
  max-width: 15rem;
  object-fit: contain;
  flex-shrink: 0;
}

.home-v2-brand {
  align-items: center;
  gap: 1rem;
}

.home-v2-brand-mark,
.home-v2-brand-badge,
.home-v2-brand-avatar {
  display: none;
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
}
`;

  if (!next.includes("/* Homepage topbar logo branding */")) {
    next = `${next.trimEnd()}\n\n${css.trimStart()}`;
  }

  return next;
});

console.log("");
console.log("Done.");
console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");
