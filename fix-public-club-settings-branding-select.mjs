import fs from "fs";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "src/lib/publicSite/publicClubSettingsService.ts",
);

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

let current = fs.readFileSync(filePath, "utf8");

let next = current;

next = next.replace(
    `publicThemeMode: true`,
    `publicThemeMode: true,
      logoUrl: true,
      logoAltText: true,
      faviconUrl: true,
      appleIconUrl: true`,
);

if (next === current) {
    console.log("No change. The branding fields may already be present.");
} else {
    fs.writeFileSync(filePath, next, "utf8");
    console.log("Patched src/lib/publicSite/publicClubSettingsService.ts");
}

console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");