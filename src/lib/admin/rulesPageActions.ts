"use server";

import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import { upsertClubRulesPageContent } from "../rulesPage/rulesPageService";
import { DEFAULT_RULES_PAGE_CONTENT } from "../rulesPage/rulesPageDefaults";
import { requireClubBySlug } from "../tenancy/tenantService";

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "ul",
    "ol",
    "li",
    "blockquote",
    "br",
    "a",
    "img",
    "div",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    "*": ["class"],
  },
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
  },
};

const optionalUrlSchema = z
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
    { message: "URL skal være en gyldig http/https URL eller en lokal Media URL." },
  );

const rulesPageSchema = z.object({
  ownRulesPdfUrl: z.string().trim().url("Flyveregler skal være en gyldig URL."),
  flightZoneImageUrl: optionalUrlSchema,
  legalTextHtml: z.string().trim().min(1, "Lovtekst skal udfyldes."),
  practicalTextHtml: z.string().trim().min(1, "Praktiske retningslinjer skal udfyldes."),
});

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateRulesPageContentAction(
  clubSlug: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/regler-og-bestemmelser`,
  );

  const parsed = rulesPageSchema.safeParse({
    ownRulesPdfUrl: getText(formData, "ownRulesPdfUrl"),
    flightZoneImageUrl: getText(formData, "flightZoneImageUrl"),
    legalTextHtml: getText(formData, "legalTextHtml"),
    practicalTextHtml: getText(formData, "practicalTextHtml"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ||
        "Der er ugyldige felter i formularen.",
    };
  }

  await upsertClubRulesPageContent(club.id, {
    ...DEFAULT_RULES_PAGE_CONTENT,
    ownRulesPdfUrl: parsed.data.ownRulesPdfUrl,
    flightZoneImageUrl: parsed.data.flightZoneImageUrl,
    legalTextHtml: sanitizeHtml(parsed.data.legalTextHtml, sanitizeOptions),
    practicalTextHtml: sanitizeHtml(parsed.data.practicalTextHtml, sanitizeOptions),
  });

  revalidatePath(`/${clubSlug}/admin/regler-og-bestemmelser`);
  revalidatePath(`/${clubSlug}/om/regler-og-bestemmelser`);
  revalidatePath(`/${clubSlug}/about`);

  return { success: true };
}
