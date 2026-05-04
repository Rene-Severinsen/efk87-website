#!/usr/bin/env bash
set -euo pipefail

python3 <<'PY'
from pathlib import Path

defaults_file = Path("src/lib/membershipPage/membershipPageDefaults.ts")
service_file = Path("src/lib/membershipPage/membershipPageService.ts")
page_file = Path("src/app/[clubSlug]/om/medlemsskab/page.tsx")

# 1) Default CTA label
defaults_text = defaults_file.read_text()
defaults_text = defaults_text.replace(
    '  ctaLabel: "Meld dig ind",',
    '  ctaLabel: "Bliv medlem",'
)
defaults_file.write_text(defaults_text)

# 2) Normalize old stored CTA labels from CMS/DB
service_text = service_file.read_text()

old_normalize = """function normalizeText(value: string | null, fallback: string): string {
  const trimmed = value?.trim();

  return trimmed || fallback;
}
"""

new_normalize = """function normalizeText(value: string | null, fallback: string): string {
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
"""

if "function normalizePrimaryCtaLabel" not in service_text:
    service_text = service_text.replace(old_normalize, new_normalize)

service_text = service_text.replace(
    '    ctaLabel: normalizeText(membershipPage.ctaLabel, DEFAULT_MEMBERSHIP_PAGE_CONTENT.ctaLabel),',
    '    ctaLabel: normalizePrimaryCtaLabel(membershipPage.ctaLabel),'
)

service_file.write_text(service_text)

# 3) Force white text on the membership page CTA button
page_text = page_file.read_text()
page_text = page_text.replace(
    'className="public-primary-button"',
    'className="public-primary-button !text-white"'
)
page_file.write_text(page_text)

print("OK: membership CTA updated.")
PY

echo
echo "Færdig."
echo "Kør nu fx:"
echo "  npm run dev"
echo "eller genstart din dev-server hvis den allerede kører."
