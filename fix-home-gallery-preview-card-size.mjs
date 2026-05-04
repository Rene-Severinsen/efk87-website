import fs from "fs";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "src/components/publicSite/homeV2/PublicClubHomePageV2.css",
);

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

let current = fs.readFileSync(filePath, "utf8");

const patch = `
/* Home gallery preview: fixed compact card size for both images and albums */
.home-v2-gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.home-v2-gallery-item {
  display: block;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}

.home-v2-gallery-image-img,
.home-v2-gallery-image,
.home-v2-gallery-image-empty {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  min-height: 0;
  height: auto;
  object-fit: cover;
  border-radius: 0.85rem;
  background: var(--home-surface);
}

.home-v2-gallery-label {
  margin-top: 0.55rem;
  color: var(--home-text);
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.25;
}

@media (max-width: 720px) {
  .home-v2-gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 430px) {
  .home-v2-gallery-grid {
    grid-template-columns: 1fr;
  }
}
`;

const cleanupPatterns = [
    /\.home-v2-gallery-grid\s*\{[\s\S]*?\}\s*/g,
    /\.home-v2-gallery-item\s*\{[\s\S]*?\}\s*/g,
    /\.home-v2-gallery-image-img\s*\{[\s\S]*?\}\s*/g,
    /\.home-v2-gallery-image-empty\s*\{[\s\S]*?\}\s*/g,
];

let next = current;

for (const pattern of cleanupPatterns) {
    next = next.replace(pattern, "");
}

next = `${next.trimEnd()}\n\n${patch.trimStart()}`;

fs.writeFileSync(filePath, next, "utf8");

console.log("Patched src/components/publicSite/homeV2/PublicClubHomePageV2.css");
console.log("");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");