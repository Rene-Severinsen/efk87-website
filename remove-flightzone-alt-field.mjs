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

patchFile("prisma/schema.prisma", (current) =>
    current
        .replace(/\n\s*flightZoneImageAlt\s+String\??/g, "")
);

patchFile("src/lib/rulesPage/rulesPageDefaults.ts", (current) =>
    current
        .replace(/\n\s*flightZoneImageAlt: string;/g, "")
        .replace(/\n\s*flightZoneImageAlt: "Flyvezone for Elektroflyveklubben af 1987",/g, "")
);

patchFile("src/lib/rulesPage/rulesPageService.ts", (current) =>
    current
        .replace(
            /\n\s*flightZoneImageAlt: normalizeText\(\s*rulesPage\.flightZoneImageAlt,\s*DEFAULT_RULES_PAGE_CONTENT\.flightZoneImageAlt,\s*\),/g,
            "",
        )
);

patchFile("src/lib/admin/rulesPageActions.ts", (current) =>
    current
        .replace(/\n\s*flightZoneImageAlt: z\.string\(\)\.trim\(\)\.min\(1, "Alt-tekst til flyvezone skal udfyldes\."\),/g, "")
        .replace(/\n\s*flightZoneImageAlt: getText\(formData, "flightZoneImageAlt"\),/g, "")
        .replace(/\n\s*flightZoneImageAlt: parsed\.data\.flightZoneImageAlt,/g, "")
);

patchFile("src/app/[clubSlug]/admin/regler-og-bestemmelser/RulesPageAdminForm.tsx", (current) =>
    current.replace(
        /\n\s*<TextInput\s+name="flightZoneImageAlt"\s+label="Alt-tekst til flyvezone"\s+value=\{initialContent\.flightZoneImageAlt\}\s*\/>/g,
        "",
    )
);

patchFile("src/app/[clubSlug]/om/regler-og-bestemmelser/page.tsx", (current) =>
    current.replace(
        /alt=\{content\.flightZoneImageAlt\}/g,
        `alt="Flyvezone for Elektroflyveklubben af 1987"`,
    )
);

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npx prisma db push");
console.log("npx prisma generate");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");