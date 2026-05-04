export interface ClubRulesPageContent {
  ownRulesPdfUrl: string;
  flightZoneImageUrl: string | null;
  legalTextHtml: string;
  practicalTextHtml: string;
}

export const DEFAULT_RULES_PAGE_CONTENT: ClubRulesPageContent = {
  ownRulesPdfUrl:
    "https://efk87.dk/files/regler/Flyveregler%20for%20Elektroflyveklubben%20af%201987.pdf",
  flightZoneImageUrl: null,
  legalTextHtml:
    "<p>Her kan klubben beskrive relevante lovkrav, myndighedsregler og forhold omkring modelflyvning.</p>",
  practicalTextHtml:
    "<p>Her kan klubben beskrive praktiske retningslinjer for sikkerhed, gæster, støjhensyn, færdsel og almindelig opførsel på pladsen.</p>",
};
