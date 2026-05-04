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

// 1. Gør prop optional
next = next.replace(
    "galleryPreview: HomepageGalleryPreviewDTO;",
    "galleryPreview?: HomepageGalleryPreviewDTO;",
);

// 2. Brug safe fallback i render
next = next.replaceAll(
    "galleryPreview={galleryPreview}",
    "galleryPreview={safeGalleryPreview}",
);

// 3. Indsæt fallback inde i komponenten, hvis den ikke findes
if (!next.includes("const safeGalleryPreview =")) {
    const functionStart = next.indexOf("export default function PublicClubHomePageV2");

    if (functionStart === -1) {
        console.error("Could not find PublicClubHomePageV2 function.");
        process.exit(1);
    }

    const bodyStart = next.indexOf("{", next.indexOf(")", functionStart));

    if (bodyStart === -1) {
        console.error("Could not find PublicClubHomePageV2 function body.");
        process.exit(1);
    }

    const fallback = `
  const safeGalleryPreview = galleryPreview ?? {
    latestImages: [],
    latestAlbums: [],
  };
`;

    next = `${next.slice(0, bodyStart + 1)}${fallback}${next.slice(bodyStart + 1)}`;
}

fs.writeFileSync(filePath, next, "utf8");

console.log("Patched src/components/publicSite/homeV2/PublicClubHomePageV2.tsx");
console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");