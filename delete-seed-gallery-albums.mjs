import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const sqlPath = path.join(process.cwd(), ".tmp-delete-seed-gallery-albums.sql");

const sql = `
DELETE FROM "GalleryImage"
WHERE "albumId" IN (
  SELECT "GalleryAlbum"."id"
  FROM "GalleryAlbum"
  INNER JOIN "Club" ON "Club"."id" = "GalleryAlbum"."clubId"
  WHERE "Club"."slug" = 'efk87'
    AND "GalleryAlbum"."title" IN (
      'Klubaften Maj',
      'Sommer flyvning 2025',
      'Kun for medlemmer'
    )
);

DELETE FROM "GalleryAlbum"
WHERE "clubId" IN (
  SELECT "id"
  FROM "Club"
  WHERE "slug" = 'efk87'
)
AND "title" IN (
  'Klubaften Maj',
  'Sommer flyvning 2025',
  'Kun for medlemmer'
);
`;

fs.writeFileSync(sqlPath, sql.trimStart(), "utf8");

try {
    execSync(`npx prisma db execute --file ${sqlPath}`, {
        stdio: "inherit",
    });

    console.log("");
    console.log("Seed gallerier er slettet permanent:");
    console.log("- Klubaften Maj");
    console.log("- Sommer flyvning 2025");
    console.log("- Kun for medlemmer");
} finally {
    if (fs.existsSync(sqlPath)) {
        fs.unlinkSync(sqlPath);
    }
}