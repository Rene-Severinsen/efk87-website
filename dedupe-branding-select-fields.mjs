import fs from "fs";
import path from "path";

const root = process.cwd();

const files = [
    "src/lib/publicSite/publicClubSettingsService.ts",
    "src/lib/publicSite/publicPageRoute.ts",
    "src/app/[clubSlug]/page.tsx",
];

const brandingFields = new Set([
    "logoUrl",
    "logoAltText",
    "faviconUrl",
    "appleIconUrl",
]);

function dedupeBrandingSelectFields(content) {
    const lines = content.split("\n");
    const seen = new Set();

    return lines
        .filter((line) => {
            const trimmed = line.trim();
            const match = trimmed.match(/^(\w+):\s*true,?$/);

            if (!match) {
                return true;
            }

            const fieldName = match[1];

            if (!brandingFields.has(fieldName)) {
                return true;
            }

            if (seen.has(fieldName)) {
                console.log(`Removed duplicate select field: ${fieldName}`);
                return false;
            }

            seen.add(fieldName);
            return true;
        })
        .join("\n");
}

for (const relativePath of files) {
    const filePath = path.join(root, relativePath);

    if (!fs.existsSync(filePath)) {
        console.warn(`Skipped ${relativePath} — file not found`);
        continue;
    }

    const current = fs.readFileSync(filePath, "utf8");
    const next = dedupeBrandingSelectFields(current);

    if (next === current) {
        console.log(`No change ${relativePath}`);
        continue;
    }

    fs.writeFileSync(filePath, next, "utf8");
    console.log(`Patched ${relativePath}`);
}

console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");