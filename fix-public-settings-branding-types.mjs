import fs from "fs";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "src/lib/publicSite/publicPageRoute.ts",
);

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

let current = fs.readFileSync(filePath, "utf8");
let next = current;

// 1. Tilføj felter i Prisma select, hvis publicPageRoute selv vælger club.settings
const selectInsertions = [
    "logoUrl: true,",
    "logoAltText: true,",
    "faviconUrl: true,",
    "appleIconUrl: true,",
];

for (const field of selectInsertions) {
    if (!next.includes(field)) {
        next = next.replace(
            "publicThemeMode: true,",
            `publicThemeMode: true,
          ${field}`,
        );
    }
}

// 2. Tilføj felter i explicit publicSettings object mapping
const objectInsertions = [
    `logoUrl: club.settings.logoUrl,`,
    `logoAltText: club.settings.logoAltText,`,
    `faviconUrl: club.settings.faviconUrl,`,
    `appleIconUrl: club.settings.appleIconUrl,`,
];

for (const field of objectInsertions) {
    if (!next.includes(field)) {
        next = next.replace(
            "publicThemeMode: club.settings.publicThemeMode,",
            `publicThemeMode: club.settings.publicThemeMode,
      ${field}`,
        );
    }
}

// 3. Hvis der findes en explicit type/interface for publicSettings, udvid den
const typeInsertions = [
    `logoUrl: string | null;`,
    `logoAltText: string | null;`,
    `faviconUrl: string | null;`,
    `appleIconUrl: string | null;`,
];

for (const field of typeInsertions) {
    if (!next.includes(field)) {
        next = next.replace(
            "publicThemeMode: string;",
            `publicThemeMode: string;
  ${field}`,
        );
    }
}

// 4. Hvis publicSettings er typed inline med weatherLongitude som sidste felt, udvid også den
if (!next.includes("logoUrl?: string | null")) {
    next = next.replace(
        "weatherLongitude: number | null;",
        `weatherLongitude: number | null;
  logoUrl?: string | null;
  logoAltText?: string | null;
  faviconUrl?: string | null;
  appleIconUrl?: string | null;`,
    );
}

if (next === current) {
    console.log("No changes made. Send src/lib/publicSite/publicPageRoute.ts if build still fails.");
} else {
    fs.writeFileSync(filePath, next, "utf8");
    console.log("Patched src/lib/publicSite/publicPageRoute.ts");
}

console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");