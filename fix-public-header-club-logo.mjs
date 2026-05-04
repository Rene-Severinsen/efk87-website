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

patchFile("src/components/publicSite/ThemedClubPageShell.tsx", (current) => {
    let next = current;

    // Ensure props exist
    if (!next.includes("logoUrl?: string | null")) {
        next = next.replace(
            "clubDisplayName: string;",
            `clubDisplayName: string;
  logoUrl?: string | null;
  logoAltText?: string | null;`,
        );
    }

    // Ensure destructuring exists
    if (!next.includes("logoUrl,")) {
        next = next.replace(
            "clubDisplayName,",
            `clubDisplayName,
  logoUrl,
  logoAltText,`,
        );
    }

    // Replace the common small initials badge pattern if present
    next = next.replace(
        /<div className="themed-club-avatar"[^>]*>[\s\S]*?<\/div>\s*<div>\s*<div className="themed-club-name">[\s\S]*?<\/div>\s*<div className="themed-club-subtitle">[\s\S]*?<\/div>\s*<\/div>/,
        `{logoUrl ? (
            <img
              src={logoUrl}
              alt={logoAltText || clubDisplayName}
              className="themed-club-logo"
            />
          ) : null}

          <div className="themed-club-brand-text">
            <div className="themed-club-name">{clubDisplayName}</div>
            <div className="themed-club-subtitle">KLUBSITE</div>
          </div>`,
    );

    // If previous patch inserted logo but old avatar still exists, keep only logo/text structure
    next = next.replace(
        /<img\s+src=\{logoUrl\}\s+alt=\{logoAltText \|\| clubDisplayName\}\s+className="themed-club-logo"\s+\/>\s*<\/div>\s*<div className="themed-club-name">/,
        `<img
              src={logoUrl}
              alt={logoAltText || clubDisplayName}
              className="themed-club-logo"
            />
          ) : null}

          <div className="themed-club-brand-text">
            <div className="themed-club-name">`,
    );

    return next;
});

patchFile("src/components/publicSite/ThemedClubPageShell.css", (current) => {
    let next = current;

    // Remove older logo rule to avoid conflicts
    next = next.replace(
        /\.themed-club-logo\s*\{[\s\S]*?\}\s*@media\s*\(max-width:\s*640px\)\s*\{[\s\S]*?\.themed-club-logo\s*\{[\s\S]*?\}\s*\}/g,
        "",
    );

    const css = `
/* Public header branding */
.themed-club-topbar,
.themed-club-header,
.themed-club-nav-shell {
  min-height: 72px;
}

.themed-club-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
  text-decoration: none;
}

.themed-club-logo {
  display: block;
  width: auto;
  height: 4.2rem;
  max-width: 12rem;
  object-fit: contain;
  flex-shrink: 0;
}

.themed-club-brand-text {
  display: grid;
  gap: 0.08rem;
  min-width: 0;
}

.themed-club-name {
  color: var(--public-heading);
  font-size: 1.45rem;
  font-weight: 850;
  line-height: 1;
  letter-spacing: -0.03em;
}

.themed-club-subtitle {
  color: var(--public-muted);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.themed-club-avatar {
  display: none;
}

.themed-club-nav {
  gap: 0.35rem;
}

.themed-club-nav a,
.themed-club-nav-link {
  padding: 0.65rem 0.85rem;
  font-size: 0.92rem;
}

@media (max-width: 900px) {
  .themed-club-logo {
    height: 3.2rem;
    max-width: 9rem;
  }

  .themed-club-name {
    font-size: 1.18rem;
  }
}

@media (max-width: 640px) {
  .themed-club-topbar,
  .themed-club-header,
  .themed-club-nav-shell {
    min-height: 64px;
  }

  .themed-club-logo {
    height: 2.7rem;
    max-width: 7.5rem;
  }

  .themed-club-name {
    font-size: 1rem;
  }

  .themed-club-subtitle {
    font-size: 0.58rem;
  }
}
`;

    if (!next.includes("/* Public header branding */")) {
        next = `${next.trimEnd()}\n\n${css.trimStart()}`;
    } else {
        next = next.replace(
            /\/\* Public header branding \*\/[\s\S]*$/,
            css.trimStart(),
        );
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