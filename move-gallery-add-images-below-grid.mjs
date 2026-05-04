import fs from "fs";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "src/app/[clubSlug]/galleri/[albumSlug]/page.tsx",
);

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

let current = fs.readFileSync(filePath, "utf8");

const beforeBlock = `{viewer.isMember ? (
        <div className="mb-6">
          <GalleryAddImagesForm clubSlug={clubSlug} albumSlug={albumSlug} />
        </div>
      ) : null}

      {album.images.length > 0 ? (`;

const afterStart = `{album.images.length > 0 ? (`;

let next = current.replace(beforeBlock, afterStart);

const emptyBlock = `) : (
        <ThemedSectionCard>
          <p className="py-8 text-center text-[var(--public-text-muted)]">
            Dette album har endnu ingen billeder.
          </p>
        </ThemedSectionCard>
      )}
    </ThemedClubPageShell>`;

const replacement = `) : (
        <ThemedSectionCard>
          <p className="py-8 text-center text-[var(--public-text-muted)]">
            Dette album har endnu ingen billeder.
          </p>
        </ThemedSectionCard>
      )}

      {viewer.isMember ? (
        <div className="mt-8">
          <GalleryAddImagesForm clubSlug={clubSlug} albumSlug={albumSlug} />
        </div>
      ) : null}
    </ThemedClubPageShell>`;

if (!next.includes(emptyBlock)) {
    console.error("Could not find gallery empty block. Send page.tsx if this fails.");
    process.exit(1);
}

next = next.replace(emptyBlock, replacement);

fs.writeFileSync(filePath, next, "utf8");

console.log("Patched src/app/[clubSlug]/galleri/[albumSlug]/page.tsx");
console.log("");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");