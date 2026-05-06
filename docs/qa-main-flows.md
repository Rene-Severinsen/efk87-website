# EFK87 QA-liste for hovedflows

Status: Stabiliseringsfase  
Formål: Sikre at de vigtigste public-, member- og adminflows virker stabilt før næste store modul.

## QA-principper

- Test som public bruger, aktivt medlem og admin.
- Test desktop og mobile/tablet hvor relevant.
- Public/member sider kontrolleres ved 390px, 768px, 1024px og 1440px.
- Ingen horisontal overflow på public/member sider.
- Admin er desktop-first, men må ikke være ubrugelig på mindre skærme.
- Datoer og dagslogik skal testes mod dansk lokal dato, ikke UTC.
- Medlemmer med status `NEW` / “Under oprettelse” må ikke optræde som aktive medlemmer.
- Udmeldte medlemmer må ikke optræde i aktive/member-facing lister.

---

## 1. Public forside

### Public bruger

- [ ] Forsiden loader uden login.
- [ ] Public hero vises korrekt.
- [ ] Public topnavigation viser kun public-relevante links.
- [ ] Kalender-marquee viser kun public kalenderindslag.
- [ ] Public forsideindhold viser kun public synligt indhold.
- [ ] Public galleri-promos viser kun public/promoverede albums.
- [ ] CTA-links giver ikke 404.
- [ ] Ingen member-only data vises.
- [ ] Responsive test: 390px / 768px / 1024px / 1440px.

### Aktivt medlem

- [ ] Forsiden viser member-dashboard.
- [ ] Fødselsdagskort vises kun hvis aktive medlemmer har fødselsdag i dag.
- [ ] Fødselsdagskort viser ikke alder.
- [ ] Fødselsdagskort er placeret over “Aktivitet på pladsen”.
- [ ] “Jeg flyver” viser korrekt dagsstatus.
- [ ] “Jeg flyver” bruger korrekt lokal dato.
- [ ] Senest online viser member aktivitet.
- [ ] Forumaktivitet vises.
- [ ] Public/member forsideindhold respekterer synlighed.
- [ ] Responsive test: 390px / 768px / 1024px / 1440px.

---

## 2. Login og adgang

### Public bruger

- [ ] Public bruger redirectes til login ved member-only sider.
- [ ] Callback URL bevares efter login.
- [ ] Login-side viser forklaring ved member-required adgang.
- [ ] Forkert login håndteres pænt.

### Aktivt medlem

- [ ] Aktivt medlem kan åbne member-only sider.
- [ ] Aktivt medlem kan ikke åbne admin-sider uden adminrolle.
- [ ] Member navigation viser relevante member actions.

### Admin

- [ ] Admin kan åbne admin.
- [ ] Admin fungerer også som member, hvor relevant.
- [ ] Admin-rolle er tenant-/club-scoped.

---

## 3. Medlemmer

### Member directory

- [ ] `/members` kræver aktivt medlem.
- [ ] Kun aktive medlemmer vises.
- [ ] Medlemmer “Under oprettelse” vises ikke.
- [ ] Udmeldte medlemmer vises ikke.
- [ ] Kontaktdata vises kun for member context.
- [ ] Avatar fallback fungerer.
- [ ] Profilbilleder vises korrekt.

### Admin medlemshåndtering

- [ ] Nyt medlem kan oprettes manuelt.
- [ ] Public ansøgning opretter `NEW` / “Under oprettelse”.
- [ ] `joinedAt` sættes kun ved overgang fra `NEW` til `ACTIVE`, hvis ikke allerede sat.
- [ ] `joinedAt` ændres ikke ved almindelige statusændringer.
- [ ] Medlemsnummer tildeles korrekt.
- [ ] MDK nummer valideres efter medlemskabstype.
- [ ] Fødselsdato gemmes korrekt.

---

## 4. Bliv medlem

- [ ] `/bliv-medlem` er public.
- [ ] Formular viser relevante felter.
- [ ] Senior/junior valideres efter fødselsår.
- [ ] MDK nummer kræves for Senior/Junior og er valgfri for Passiv.
- [ ] Ansøgning oprettes som “Under oprettelse”.
- [ ] Der oprettes ikke fake login-bruger.
- [ ] Næste medlemsnummer reserveres/tildeles korrekt efter nuværende regel.
- [ ] Fejlmeddelelser er forståelige.

---

## 5. Kalender

### Public bruger

- [ ] `/kalender` loader uden login.
- [ ] Public bruger ser kun public kalenderindslag.
- [ ] Tidligere kalenderindslag vises ikke på oversigten.
- [ ] Kalenderkort står korrekt i datoorden.
- [ ] Detaljeside for public kalenderindslag virker.
- [ ] Member-only kalenderindslag giver ikke public adgang.

### Aktivt medlem

- [ ] Medlem ser både public og member-only kalenderindslag.
- [ ] Kalenderdetaljer virker for member-only indslag.
- [ ] Marquee viser korrekt kommende entries.
- [ ] Marquee hastighed/layout er stabilt.
- [ ] Dato/tid vises korrekt efter dansk lokal dato.

### Admin

- [ ] Admin kan oprette kalenderindslag.
- [ ] Admin kan oprette gentagne ugentlige indslag.
- [ ] Gentagelse opretter korrekt antal.
- [ ] Admin kan publicere/afpublicere.
- [ ] Admin kan slette.
- [ ] Visibility public/member-only respekteres.

---

## 6. Jeg flyver

- [ ] `/jeg-flyver` kræver aktivt medlem.
- [ ] Standarddato er dags dato efter dansk lokal dato.
- [ ] Medlem kan oprette flyvemelding for i dag.
- [ ] Medlem kan oprette flyvemelding for fremtidig dato.
- [ ] Medlem kan ikke oprette dublet for samme dag.
- [ ] Medlem kan aflyse egen flyvemelding.
- [ ] Liste viser dagens relevante flyvemeldinger.
- [ ] Forsidekort opdateres korrekt.
- [ ] Public bruger kan ikke oprette flyvemelding.

---

## 7. Galleri og media

### Public galleri

- [ ] `/galleri` er hybrid public/member efter visibility.
- [ ] Public bruger ser kun public albums.
- [ ] Public bruger ser ikke member-only albums.
- [ ] Albumdetaljer respekterer visibility.

### Aktivt medlem

- [ ] Medlem ser public og member-only albums.
- [ ] `/galleri/nyt` kræver aktivt medlem.
- [ ] Upload route kræver aktivt medlem og userId.
- [ ] Nyt galleri kan oprettes.
- [ ] Billeder kan uploades.
- [ ] Albumvisning fungerer efter upload.

### Admin media

- [ ] Admin media kræver admin.
- [ ] Upload billede virker.
- [ ] Mediedepot vises korrekt.
- [ ] Kopier URL virker.
- [ ] Deaktivering/sletning virker efter nuværende regel.
- [ ] Ingen hardcoded public styling i admin.

---

## 8. Forum

- [ ] `/forum` kræver aktivt medlem.
- [ ] Kategoriliste loader.
- [ ] Kategoriside loader.
- [ ] Trådside loader.
- [ ] Ny tråd kræver aktivt medlem.
- [ ] Svar kræver aktivt medlem.
- [ ] Badge/logik for aktivitet virker.
- [ ] Navne/avatar vises korrekt.
- [ ] Public bruger redirectes til login ved forum.
- [ ] Forumdata lækker ikke public.
- [ ] Admin kan administrere kategorier.

---

## 9. Flyveskole

### Skolekalender

- [ ] `/flyveskole/skolekalender` kræver aktivt medlem.
- [ ] Medlem kan se publicerede sessions.
- [ ] Ledige tider vises korrekt.
- [ ] Bookede tider vises korrekt.
- [ ] Medlem kan booke ledig tid.
- [ ] Medlem kan afmelde egen booking.
- [ ] Afmelding fejler ikke ved eksisterende gammel `CANCELLED` booking.
- [ ] Medlem kan ikke booke samme slot to gange.
- [ ] Kun én elev pr. slot.
- [ ] Dato/tid vises korrekt.
- [ ] Tom kalender vises pænt.

### Admin flyveskole

- [ ] Admin kan oprette skoledag/session.
- [ ] Admin kan oprette slots.
- [ ] Admin kan publicere/skjule.
- [ ] Admin kan slette/aflyse session efter nuværende regel.
- [ ] Admin bliver på Skolekalender-tab efter gem.
- [ ] Instruktør vælges kun blandt aktive instruktører.

---

## 10. Forsideindhold og tilmeldinger

- [ ] Public ser kun public aktive indholdsbokse.
- [ ] Medlem ser public og member-only aktive indholdsbokse.
- [ ] Synlighedsperiode respekteres.
- [ ] Sortering respekteres.
- [ ] Rich text vises pænt.
- [ ] Tilmelding kræver aktivt medlem.
- [ ] Signup deadline respekteres.
- [ ] Max antal/quantity-regler virker.
- [ ] Medlem kan tilmelde sig.
- [ ] Admin kan se tilmeldinger.
- [ ] Admin kan fjerne/annullere tilmelding.

---

## 11. Artikler

- [ ] Public ser kun public publicerede artikler.
- [ ] Medlem ser public og member-only publicerede artikler.
- [ ] Legacy-importerede artikler er member-only som default.
- [ ] Artikel-detalje respekterer visibility.
- [ ] Filter/tags virker efter nuværende regel.
- [ ] Admin kan oprette artikel.
- [ ] Admin kan redigere artikel.
- [ ] Admin kan styre status og visibility.
- [ ] WYSIWYG fungerer acceptabelt.
- [ ] URL-image indsættelse fungerer efter nuværende regel.

---

## 12. Admin samlet

### Adgang

- [ ] Alle `/admin/...` routes kræver admin.
- [ ] Admin upload routes kræver admin.
- [ ] Admin rolle er club-scoped.
- [ ] Non-admin medlem redirectes eller afvises korrekt.
- [ ] Public bruger redirectes til login.

### Modenhed

- [ ] Ingen døde admin links.
- [ ] Dashboard viser relevante tal.
- [ ] Systemstatus viser relevant status eller er tydeligt placeholder.
- [ ] Mailinglister er tydeligt placeholder, hvis ikke implementeret.
- [ ] Eksport er tydeligt placeholder, hvis ikke implementeret.
- [ ] Admin design er konsistent med admin primitives.
- [ ] Ingen inline/hardcoded farver ifølge check.

---

## 13. Teknisk regression

Kør efter større rettelser:

    rm -rf .next
    npm run check:public-theme
    npx tsc --noEmit
    npm run build

Supplerende kontroller:

- [ ] Ingen midlertidige patch-scripts i projektrod.
- [ ] Ingen uønskede filer staged i git.
- [ ] Ingen blandede Prisma singleton imports.
- [ ] Ingen `any`, `@ts-ignore` eller fake runtime fallbacks.
- [ ] Public/member styling bruger eksisterende tokens/primitives.
- [ ] Admin styling holdes separat fra public styling.
