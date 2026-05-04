import fs from "node:fs";

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function write(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Patched ${filePath}`);
}

/**
 * 1) Remove illegal Tailwind text-white class from membership CTA.
 */
const pageFile = "src/app/[clubSlug]/om/medlemsskab/page.tsx";
let page = read(pageFile);

page = page.replaceAll(
  'className="public-primary-button !text-white"',
  'className="public-primary-button"',
);

write(pageFile, page);

/**
 * 2) Remove duplicate normalizePrimaryCtaLabel implementations.
 */
const serviceFile = "src/lib/membershipPage/membershipPageService.ts";
let service = read(serviceFile);

const functionPattern =
  /function normalizePrimaryCtaLabel\(value: string \| null\): string \{\s*const trimmed = value\?\.trim\(\);\s*if \(!trimmed \|\| trimmed === "Meld dig ind"\) \{\s*return "Bliv medlem";\s*\}\s*return trimmed;\s*\}\s*/g;

const matches = [...service.matchAll(functionPattern)];

if (matches.length > 1) {
  let first = true;
  service = service.replace(functionPattern, (match) => {
    if (first) {
      first = false;
      return match;
    }

    return "";
  });
}

if (!service.includes("function normalizePrimaryCtaLabel")) {
  service = service.replace(
`function normalizeText(value: string | null, fallback: string): string {
  const trimmed = value?.trim();

  return trimmed || fallback;
}
`,
`function normalizeText(value: string | null, fallback: string): string {
  const trimmed = value?.trim();

  return trimmed || fallback;
}

function normalizePrimaryCtaLabel(value: string | null): string {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === "Meld dig ind") {
    return "Bliv medlem";
  }

  return trimmed;
}
`,
  );
}

service = service.replaceAll(
  'ctaLabel: normalizeText(membershipPage.ctaLabel, DEFAULT_MEMBERSHIP_PAGE_CONTENT.ctaLabel),',
  'ctaLabel: normalizePrimaryCtaLabel(membershipPage.ctaLabel),',
);

write(serviceFile, service);

/**
 * 3) Ensure public-primary-button uses white/on-primary token via CSS, not Tailwind.
 */
const globalsFile = "src/app/globals.css";
let globals = read(globalsFile);

if (!globals.includes("/* Public primary button hardening */")) {
  globals += `

/* Public primary button hardening */
.public-primary-button {
  color: var(--public-text-on-primary);
}

.public-primary-button:hover,
.public-primary-button:focus-visible {
  color: var(--public-text-on-primary);
}
`;
}

write(globalsFile, globals);

console.log("");
console.log("Done.");
