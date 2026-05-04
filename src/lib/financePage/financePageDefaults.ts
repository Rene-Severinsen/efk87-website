export interface ClubFinancePageContent {
  introText: string;
  expenseEmail: string;
  requiredInfoText: string;
  approvalText: string;
  advanceText: string;
  payoutText: string;
}

export const DEFAULT_FINANCE_PAGE_CONTENT: ClubFinancePageContent = {
  introText:
    "Har man haft godkendte udgifter, som skal refunderes af klubben, bedes udgiftsbilaget sendes som vedhæftet fil til klubbens bilagsmail.",
  expenseEmail: "bilag@efk87.dk",
  requiredInfoText:
    "På udgiftsbilaget skrives navn, MobilePay-nummer eller bankoplysninger med registreringsnummer og kontonummer.",
  approvalText:
    "Alle udlæg skal aftales med kassereren eller et andet bestyrelsesmedlem, inden der købes ind.",
  advanceText:
    "Hvis du forventes at indkøbe for kr. 1.000,- eller mere, kan du efter aftale med kassereren få udbetalt et forskud.",
  payoutText:
    "Når du har indsendt bilag på den afholdte udgift, vil beløbet blive overført til dig inden for 3 uger efter indlevering af bilag.",
};
