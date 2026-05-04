import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/app/[clubSlug]/page.tsx");

if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

let current = fs.readFileSync(filePath, "utf8");
let next = current;

if (!next.includes('import type { Metadata } from "next";')) {
  next = `import type { Metadata } from "next";\n${next}`;
}

if (!next.includes("getClubBrandingMetadata")) {
  next = next.replace(
    /^(import[\s\S]*?;\n)(?!import)/,
    `$1import { getClubBrandingMetadata } from "../../lib/branding/clubBrandingMetadata";\n`,
  );
}

if (!next.includes("generateMetadata")) {
  next = `${next.trimEnd()}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubSlug: string }>;
}): Promise<Metadata> {
  const { clubSlug } = await params;

  return getClubBrandingMetadata(clubSlug);
}
`;
}

fs.writeFileSync(filePath, next, "utf8");

console.log("Patched src/app/[clubSlug]/page.tsx");
console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");
