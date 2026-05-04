import fs from "fs";
import path from "path";

const root = process.cwd();

function patchOptionalUrlSchema(relativePath, errorMessage) {
    const absolutePath = path.join(root, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`Skipped ${relativePath} — file not found`);
        return;
    }

    const current = fs.readFileSync(absolutePath, "utf8");

    const start = current.indexOf("const optionalUrlSchema = z");
    const end = current.indexOf("\n\nconst ", start + 1);

    if (start === -1 || end === -1) {
        console.error(`Could not find optionalUrlSchema block in ${relativePath}`);
        return;
    }

    const replacement = `const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .refine(
    (value) => {
      if (!value) return true;

      if (value.startsWith("/uploads/")) {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "${errorMessage}" },
  );`;

    const next = `${current.slice(0, start)}${replacement}${current.slice(end)}`;

    fs.writeFileSync(absolutePath, next, "utf8");
    console.log(`Patched ${relativePath}`);
}

patchOptionalUrlSchema(
    "src/lib/admin/locationPageActions.ts",
    "Billed-URL skal være en gyldig http/https URL eller en lokal Media URL.",
);

patchOptionalUrlSchema(
    "src/lib/admin/rulesPageActions.ts",
    "URL skal være en gyldig http/https URL eller en lokal Media URL.",
);

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");