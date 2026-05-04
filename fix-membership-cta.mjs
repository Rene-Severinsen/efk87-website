import fs from "node:fs";

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Patched ${filePath}`);
  } else {
    console.log(`No change ${filePath}`);
  }
}

replaceInFile("src/lib/membershipPage/membershipPageDefaults.ts", [
  [
    '  ctaLabel: "Meld dig ind",',
    '  ctaLabel: "Bliv medlem",',
  ],
]);

replaceInFile("src/lib/membershipPage/membershipPageService.ts", [
  [
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
  ],
  [
    '    ctaLabel: normalizeText(membershipPage.ctaLabel, DEFAULT_MEMBERSHIP_PAGE_CONTENT.ctaLabel),',
    '    ctaLabel: normalizePrimaryCtaLabel(membershipPage.ctaLabel),',
  ],
]);

replaceInFile("src/app/[clubSlug]/om/medlemsskab/page.tsx", [
  [
    'className="public-primary-button"',
    'className="public-primary-button !text-white"',
  ],
]);
