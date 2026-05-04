export interface MembershipFeeContent {
  id?: string;
  title: string;
  price: string;
  signupFee: string;
  period: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ClubMembershipPageContent {
  introText: string;
  processIntro: string;
  stepOneTitle: string;
  stepOneText: string;
  stepTwoTitle: string;
  stepTwoText: string;
  stepThreeTitle: string;
  stepThreeText: string;
  paymentText: string;
  practicalText: string;
  ctaLabel: string;
  contactCtaLabel: string;
  fees: MembershipFeeContent[];
}

export const DEFAULT_MEMBERSHIP_PAGE_CONTENT: ClubMembershipPageContent = {
  introText:
    "Her finder du information om medlemskab, indmeldelse, kontingenter og opkrævning.",
  processIntro:
    "Indmeldelse sker selvbetjent via klubbens indmeldelsesformular. Når den fremsendte faktura er betalt, aktiveres medlemskabet automatisk.",
  stepOneTitle: "Udfyld indmeldelsesformularen",
  stepOneText:
    "Vælg medlemstype og indtast dine oplysninger i formularen.",
  stepTwoTitle: "Betal den fremsendte faktura",
  stepTwoText:
    "Når formularen er sendt, modtager du en faktura/opkrævning med betalingsoplysninger.",
  stepThreeTitle: "Medlemskabet aktiveres",
  stepThreeText:
    "Når betalingen er registreret, aktiveres medlemskabet automatisk.",
  paymentText:
    "Efter indmeldelse fremsendes faktura. Betaling skal ske med korrekt betalingsreference. Medlemsnummer bruges som reference, når det fremgår af opkrævningen. Medlemskabet er først aktivt, når betalingen er registreret.",
  practicalText:
    "Har du spørgsmål om kontingent og betaling, kan du kontakte kassereren. Har du spørgsmål om skoleflyvning eller praktisk opstart, kan du kontakte klubbens instruktører.",
  ctaLabel: "Meld dig ind",
  contactCtaLabel: "Se kontaktpersoner",
  fees: [
    {
      title: "Senior",
      price: "Udfyld pris",
      signupFee: "Udfyld gebyr",
      period: "pr. år",
      description: "For medlemmer fra og med det år, man fylder 18.",
      sortOrder: 10,
      isActive: true,
    },
    {
      title: "Junior",
      price: "Udfyld pris",
      signupFee: "Udfyld gebyr",
      period: "pr. år",
      description: "For medlemmer under 18 år.",
      sortOrder: 20,
      isActive: true,
    },
    {
      title: "Passiv",
      price: "Udfyld pris",
      signupFee: "Udfyld gebyr",
      period: "pr. år",
      description: "For passive medlemmer uden aktiv flyveret.",
      sortOrder: 30,
      isActive: true,
    },
  ],
};
