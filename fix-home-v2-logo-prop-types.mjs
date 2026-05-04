import fs from "fs";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "src/components/publicSite/homeV2/PublicClubHomePageV2.tsx",
);

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

let current = fs.readFileSync(filePath, "utf8");
let next = current;

// Udvid den manuelle settings-type i PublicClubHomePageV2Props
next = next.replace(
    `publicThemeMode: string;`,
    `publicThemeMode: string;
      logoUrl: string | null;
      logoAltText: string | null;
      faviconUrl?: string | null;
      appleIconUrl?: string | null;`,
);

// Hvis typen er inline uden semikolon-variant
next = next.replace(
    `publicThemeMode: string`,
    `publicThemeMode: string;
      logoUrl: string | null;
      logoAltText: string | null;
      faviconUrl?: string | null;
      appleIconUrl?: string | null`,
);

// Fjern evt. dobbelt indsættelse hvis begge replace ramte forkert
next = next.replaceAll(
    `logoUrl: string | null;
      logoAltText: string | null;
      faviconUrl?: string | null;
      appleIconUrl?: string | null;
      logoUrl: string | null;
      logoAltText: string | null;
      faviconUrl?: string | null;
      appleIconUrl?: string | null;`,
    `logoUrl: string | null;
      logoAltText: string | null;
      faviconUrl?: string | null;
      appleIconUrl?: string | null;`,
);

if (next === current) {
    console.log("No change made. Send PublicClubHomePageV2.tsx if it still fails.");
} else {
    fs.writeFileSync(filePath, next, "utf8");
    console.log("Patched src/components/publicSite/homeV2/PublicClubHomePageV2.tsx");
}

console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");