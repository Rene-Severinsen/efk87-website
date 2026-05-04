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

patchFile("src/app/[clubSlug]/galleri/nyt/NewGalleryForm.tsx", (current) =>
    current.replaceAll("file:text-white", "file:text-[var(--public-primary-contrast)]"),
);

patchFile("src/app/[clubSlug]/galleri/nyt/upload/route.ts", (current) => {
    let next = current;

    if (!next.includes("getMemberProfileId")) {
        next = next.replace(
            `import { createMemberGalleryWithImages } from "../../../../../lib/gallery/galleryMemberService";`,
            `import { createMemberGalleryWithImages } from "../../../../../lib/gallery/galleryMemberService";
import { getMemberProfileId } from "../../../../../lib/members/memberProfileService";`,
        );
    }

    next = next.replace(
        `if (!viewer.isMember || !viewer.memberProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du skal være logget ind som medlem for at oprette galleri.",
        },
        { status: 403 },
      );
    }`,
        `if (!viewer.isMember || !viewer.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du skal være logget ind som medlem for at oprette galleri.",
        },
        { status: 403 },
      );
    }

    const memberProfileId = await getMemberProfileId(club.id, viewer.userId);

    if (!memberProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke finde din medlemsprofil.",
        },
        { status: 403 },
      );
    }`,
    );

    next = next.replaceAll(
        `memberProfileId: viewer.memberProfileId,`,
        `memberProfileId,`,
    );

    return next;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");