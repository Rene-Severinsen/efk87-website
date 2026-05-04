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

patchFile("src/app/[clubSlug]/admin/regler-og-bestemmelser/page.tsx", (current) => {
    let next = current;

    if (!next.includes("listClubMediaAssets")) {
        next = next.replace(
            `import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";`,
            `import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";`,
        );
    }

    next = next.replace(
        `const content = await getClubRulesPageContent(club.id);`,
        `const [content, mediaAssets] = await Promise.all([
    getClubRulesPageContent(club.id),
    listClubMediaAssets(club.id),
  ]);`,
    );

    next = next.replace(
        `<RulesPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
        />`,
        `<RulesPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
          mediaAssets={mediaAssets}
        />`,
    );

    return next;
});

patchFile("src/app/[clubSlug]/admin/regler-og-bestemmelser/RulesPageAdminForm.tsx", (current) => {
    let next = current;

    if (!next.includes("MediaUrlPicker")) {
        next = next.replace(
            `import { ClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageDefaults";`,
            `import { ClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageDefaults";
import { ClubMediaAssetDTO } from "../../../../lib/media/mediaTypes";
import MediaUrlPicker from "../../../../components/admin/media/MediaUrlPicker";`,
        );
    }

    next = next.replace(
        `initialContent: ClubRulesPageContent;`,
        `initialContent: ClubRulesPageContent;
  mediaAssets: ClubMediaAssetDTO[];`,
    );

    next = next.replace(
        `initialContent,
}: RulesPageAdminFormProps)`,
        `initialContent,
  mediaAssets,
}: RulesPageAdminFormProps)`,
    );

    next = next.replace(
        `<TextInput
              name="flightZoneImageUrl"
              label="Link til billede over flyvezone"
              value={initialContent.flightZoneImageUrl}
              placeholder="https://..."
            />`,
        `<MediaUrlPicker
              name="flightZoneImageUrl"
              label="Billede over flyvezone"
              value={initialContent.flightZoneImageUrl}
              assets={mediaAssets}
            />`,
    );

    next = next.replace(
        `<TextInput
                name="flightZoneImageUrl"
                label="Link til billede over flyvezone"
                value={initialContent.flightZoneImageUrl}
                placeholder="https://..."
              />`,
        `<MediaUrlPicker
                name="flightZoneImageUrl"
                label="Billede over flyvezone"
                value={initialContent.flightZoneImageUrl}
                assets={mediaAssets}
              />`,
    );

    next = next.replace(
        `<TextInput
            name="flightZoneImageUrl"
            label="Link til billede over flyvezone"
            value={initialContent.flightZoneImageUrl}
            placeholder="https://..."
          />`,
        `<MediaUrlPicker
            name="flightZoneImageUrl"
            label="Billede over flyvezone"
            value={initialContent.flightZoneImageUrl}
            assets={mediaAssets}
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