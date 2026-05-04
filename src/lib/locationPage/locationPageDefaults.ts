export interface ClubLocationPageContent {
    accessNotice: string;
    drivingGuide: string;
    parkingGuide: string;

    accessImageUrl: string | null;
    accessImageTitle: string;
    accessImageDescription: string;
    accessImageAlt: string;

    drivingImageUrl: string | null;
    drivingImageTitle: string;
    drivingImageDescription: string;
    drivingImageAlt: string;

    parkingImageUrl: string | null;
    parkingImageTitle: string;
    parkingImageDescription: string;
    parkingImageAlt: string;

    indoorTitle: string;
    indoorDescription: string;
    indoorVenueName: string;
    indoorAddress: string;
    indoorSchedule: string;
    indoorNote: string;

    indoorImageUrl: string | null;
    indoorImageTitle: string;
    indoorImageDescription: string;
    indoorImageAlt: string;
}

export const DEFAULT_LOCATION_PAGE_CONTENT: ClubLocationPageContent = {
    accessNotice:
        "Kør efter Faldskærmsvej, 3500 Værløse, men drej til højre ad betonbanen ved Propelvej. Følg derefter anvisningen til klubområdet.",

    drivingGuide:
        "Kør efter Faldskærmsvej, 3500 Værløse, men drej til højre ad betonbanen ved Propelvej. Lige før Faldskærmsvej starter, kører du ind på betonbanen.\n\nFor enden af betonbanen er der en bom. Cykler og gående kan komme igennem. Det kan give problemer, hvis navigationsapps forsøger at føre dig via andre adgangsveje i området.\n\nSkal du ind med bil, kræver det normalt adgang efter aftale med klubben. Kontakt en relevant kontaktperson, hvis du er i tvivl.",

    parkingGuide:
        "Parkér på skrå på modsat side af betonklodserne inden bommen helt ind mod flyvestationen. Parkér ikke på betonbanen eller foran bommen.\n\nUndgå at køre efter kortforslag, der fører gennem private eller lukkede områder. Det giver unødig gene for naboer og andre brugere af området.\n\nEr du ny besøgende, så spørg hellere en ekstra gang. Det er lettere end at skulle vende et sted, hvor man egentlig ikke skulle have været.",

    accessImageUrl: null,
    accessImageTitle: "Kort over adgangsvej til pladsen",
    accessImageDescription:
        "Her vises senere et tydeligt billede/kort, der viser den korrekte adgangsvej til klubområdet.",
    accessImageAlt: "Kort over adgangsvej til EFK87",

    drivingImageUrl: null,
    drivingImageTitle: "Kørselsvej og betonbane",
    drivingImageDescription:
        "Her vises senere billede/kort over betonbanen, bommen og den korrekte vej ind.",
    drivingImageAlt: "Kørselsvej og betonbane til EFK87",

    parkingImageUrl: null,
    parkingImageTitle: "Parkering og bom",
    parkingImageDescription:
        "Her vises senere billede/kort over parkering, bom og praktisk adgang til flyveområdet.",
    parkingImageAlt: "Parkering og bom ved EFK87",

    indoorTitle: "Indendørs flyvning",
    indoorDescription:
        "Klubben har også indendørsflyvning i vintersæsonen. Her flyves der med mindre modeller i hal, når vejret og sæsonen kalder på indendørs aktivitet.",
    indoorVenueName: "Solvanghallen",
    indoorAddress: "Solvangskolen\nNordtoftevej 58\n3520 Farum",
    indoorSchedule: "Typisk søndag kl. 18–22 i sæsonen.",
    indoorNote:
        "Tider og adgang kan ændre sig. Følg klubbens aktuelle informationer, hvis der annonceres særskilte tider for indendørsflyvning.",

    indoorImageUrl: null,
    indoorImageTitle: "Indendørsflyvning og parkering",
    indoorImageDescription:
        "Her vises senere billede/kort over hal, indgang og parkering til indendørsflyvning.",
    indoorImageAlt: "Indendørsflyvning og parkering",
};