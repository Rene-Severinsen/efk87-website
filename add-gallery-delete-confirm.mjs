import fs from "fs";
import path from "path";

const root = process.cwd();

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

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

writeFile(
    "src/app/[clubSlug]/admin/galleri/ArchiveGalleryButton.tsx",
    `
"use client";

import { archiveGalleryAdminAction } from "../../../../lib/admin/galleryAdminActions";

interface ArchiveGalleryButtonProps {
  clubSlug: string;
  albumId: string;
  albumTitle: string;
}

export default function ArchiveGalleryButton({
  clubSlug,
  albumId,
  albumTitle,
}: ArchiveGalleryButtonProps) {
  async function archiveGallery() {
    const confirmed = window.confirm(
      \`Er du sikker på, at du vil slette/arkivere galleriet "\${albumTitle}"?\\n\\nGalleriet fjernes fra public visning, men data slettes ikke permanent.\`,
    );

    if (!confirmed) {
      return;
    }

    await archiveGalleryAdminAction(clubSlug, albumId);
  }

  return (
    <button
      type="button"
      onClick={archiveGallery}
      className="admin-btn"
      style={{ color: "#fca5a5" }}
    >
      Slet galleri
    </button>
  );
}
`,
);

patchFile("src/app/[clubSlug]/admin/galleri/page.tsx", (current) => {
    let next = current;

    if (!next.includes("ArchiveGalleryButton")) {
        next = next.replace(
            `import { archiveGalleryAdminAction } from "../../../../lib/admin/galleryAdminActions";`,
            `import ArchiveGalleryButton from "./ArchiveGalleryButton";`,
        );
    }

    next = next.replace(
        `<form action={archiveGalleryAdminAction.bind(null, clubSlug, album.id)}>
                          <button
                            type="submit"
                            className="admin-btn"
                            style={{ color: "#fca5a5" }}
                          >
                            Slet galleri
                          </button>
                        </form>`,
        `<ArchiveGalleryButton
                          clubSlug={clubSlug}
                          albumId={album.id}
                          albumTitle={album.title}
                        />`,
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