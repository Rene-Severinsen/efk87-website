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

const pagesWithoutPublicSettings = [
    "src/app/[clubSlug]/forside-indhold/[contentId]/tilmeldinger/page.tsx",
    "src/app/[clubSlug]/kalender/[entryId]/page.tsx",
    "src/app/[clubSlug]/login/page.tsx",
];

for (const file of pagesWithoutPublicSettings) {
    patchFile(file, (current) =>
        current
            .replaceAll(
                "logoUrl={publicSettings?.logoUrl ?? null}",
                "logoUrl={club.settings?.logoUrl ?? null}",
            )
            .replaceAll(
                "logoAltText={publicSettings?.logoAltText ?? null}",
                "logoAltText={club.settings?.logoAltText ?? null}",
            ),
    );
}

patchFile("src/lib/branding/clubBrandingService.ts", (current) => {
    let next = current;

    next = next.replace(
        `create: {
      clubId,
      logoUrl,
      logoAltText: normalizeNullableText(logoAltText),
      faviconUrl,
      appleIconUrl,
    },`,
        `create: {
      clubId,
      displayName: clubSlug,
      shortName: clubSlug.toUpperCase(),
      logoUrl,
      logoAltText: normalizeNullableText(logoAltText),
      faviconUrl,
      appleIconUrl,
    },`,
    );

    return next;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");