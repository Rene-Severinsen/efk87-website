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

function dedupeModelFields(schema, modelName) {
    const modelStart = schema.indexOf(`model ${modelName} {`);

    if (modelStart === -1) {
        console.warn(`Model not found: ${modelName}`);
        return schema;
    }

    const modelEnd = schema.indexOf("\n}", modelStart);

    if (modelEnd === -1) {
        console.warn(`Model end not found: ${modelName}`);
        return schema;
    }

    const before = schema.slice(0, modelStart);
    const model = schema.slice(modelStart, modelEnd + 2);
    const after = schema.slice(modelEnd + 2);

    const lines = model.split("\n");
    const seenFields = new Set();
    const cleanedLines = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (
            !trimmed ||
            trimmed.startsWith("model ") ||
            trimmed === "}" ||
            trimmed.startsWith("@@") ||
            trimmed.startsWith("//")
        ) {
            cleanedLines.push(line);
            continue;
        }

        const fieldName = trimmed.split(/\s+/)[0];

        if (seenFields.has(fieldName)) {
            console.log(`Removed duplicate ${modelName}.${fieldName}`);
            continue;
        }

        seenFields.add(fieldName);
        cleanedLines.push(line);
    }

    return `${before}${cleanedLines.join("\n")}${after}`;
}

patchFile("prisma/schema.prisma", (current) => {
    let next = current;

    next = dedupeModelFields(next, "GalleryAlbum");
    next = dedupeModelFields(next, "GalleryImage");

    return next;
});

patchFile("src/app/[clubSlug]/preview/home-v2/page.tsx", (current) => {
    if (current.includes("galleryPreview={")) return current;

    const mockGalleryPreview = `const galleryPreview = {
    latestImages: [],
    latestAlbums: [],
  };
`;

    let next = current;

    const functionStartMatch = next.match(/export default async function [^{]+{\n/);

    if (functionStartMatch && !next.includes("const galleryPreview = {")) {
        const insertAt = functionStartMatch.index + functionStartMatch[0].length;
        next = `${next.slice(0, insertAt)}  ${mockGalleryPreview}\n${next.slice(insertAt)}`;
    }

    next = next.replace(
        /(<PublicClubHomePageV2[\s\S]*?footerData={footerData})/,
        `$1
      galleryPreview={galleryPreview}`,
    );

    return next;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npx prisma db push");
console.log("npx prisma generate");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");