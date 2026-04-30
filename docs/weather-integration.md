# Vejr Integration (Open-Meteo)

Denne dokumentation beskriver integrationen af vejrdata fra Open-Meteo på klubbens forside.

## Kilde
Vi bruger [Open-Meteo](https://open-meteo.com/) som kilde til vejrdata. 
- API URL: `https://api.open-meteo.com/v1/forecast`
- Der kræves ingen API-nøgle til almindelig brug.

## Indstillinger og Koordinater
Klub-specifikke koordinater kan konfigureres i **Admin → Site Settings**.
Hvis ingen koordinater er angivet, bruges følgende fallback-koordinater (EFK87):
- Latitude: `55.7656649`
- Longitude: `12.3115583`

## Validering
- Latitude skal være mellem -90 og 90.
- Longitude skal være mellem -180 og 180.
- Tomme værdier er tilladt og vil resultere i brug af fallback-koordinater.

## Cache og Performance
- Vejrdata hentes udelukkende server-side.
- Data caches i 1800 sekunder (30 minutter) ved hjælp af Next.js `fetch` cache (`revalidate: 1800`).
- Forsiden vil ikke fejle, hvis API'et er utilgængeligt; vejret vil blot ikke blive vist (eller vise "Henter...").

## Vejrbemærkninger (Short Comment)
Logikken for vejrbemærkninger er baseret på følgende regler:
- Nedbør >= 1 mm: "Regn i luften"
- Vindhastighed >= 10 m/s: "Meget vind"
- Vindhastighed >= 6 m/s: "Frisk vind"
- Vindhastighed <= 2 m/s og ingen nedbør: "Stille vejr"
- Ingen nedbør: "Fine forhold"
- Fallback: "Tjek vejret"

## Teknisk Implementering
- Service: `src/lib/weather/openMeteoWeatherService.ts`
- Admin UI: `src/app/[clubSlug]/admin/site-settings/page.tsx`
- Homepage Integration: `src/components/publicSite/homeV2/PublicClubHomePageV2.tsx`
