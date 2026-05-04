import fs from "node:fs";

function patchFile(filePath, patcher) {
  const before = fs.readFileSync(filePath, "utf8");
  const after = patcher(before);

  if (before === after) {
    console.log(`No change ${filePath}`);
    return;
  }

  fs.writeFileSync(filePath, after, "utf8");
  console.log(`Patched ${filePath}`);
}

/**
 * Add a dedicated topbar primary CTA class.
 */
patchFile("src/components/publicSite/ThemedTopBar.tsx", (content) => {
  return content.replaceAll(
    "border border-[var(--public-primary)] bg-[var(--public-primary)] text-[var(--public-text-on-primary)] hover:opacity-90",
    "efk-topbar-primary-action border border-[var(--public-primary)] bg-[var(--public-primary)] text-[var(--public-text-on-primary)] hover:opacity-90",
  );
});

/**
 * Force primary CTA text to white without using Tailwind text-white.
 * This covers:
 * - Topbar Bliv medlem
 * - Membership page Bliv medlem
 * - Any shared public primary button
 */
patchFile("src/app/globals.css", (content) => {
  const block = `
/* Public primary CTA text contrast hardening */
.efk-topbar-primary-action,
.efk-topbar-primary-action:visited,
.efk-topbar-primary-action:hover,
.efk-topbar-primary-action:focus-visible,
.public-primary-button,
.public-primary-button:visited,
.public-primary-button:hover,
.public-primary-button:focus-visible {
  color: rgb(255 255 255) !important;
}
`;

  if (content.includes("/* Public primary CTA text contrast hardening */")) {
    return content;
  }

  return `${content.trimEnd()}\n\n${block.trimStart()}`;
});

console.log("");
console.log("Done.");
