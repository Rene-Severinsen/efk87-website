import fs from "fs";
import path from "path";

const root = process.cwd();

const candidates = [
    "next.config.ts",
    "next.config.mjs",
    "next.config.js",
];

const file = candidates.find((candidate) =>
    fs.existsSync(path.join(root, candidate)),
);

if (!file) {
    console.error("Fandt ingen next.config.ts/.mjs/.js i projektroden.");
    process.exit(1);
}

const filePath = path.join(root, file);
const current = fs.readFileSync(filePath, "utf8");

if (current.includes("bodySizeLimit")) {
    console.log(`${file} har allerede bodySizeLimit.`);
    process.exit(0);
}

let next = current;

if (current.includes("experimental:")) {
    next = current.replace(
        /experimental:\s*{/,
        `experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },`,
    );
} else {
    next = current.replace(
        /const nextConfig\s*=\s*{/,
        `const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },`,
    );
}

if (next === current) {
    console.error(`Kunne ikke patche ${file}. Send filen, så retter jeg den manuelt.`);
    process.exit(1);
}

fs.writeFileSync(filePath, next, "utf8");
console.log(`Patched ${file}`);
console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run dev");