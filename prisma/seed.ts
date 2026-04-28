import prisma from "../src/lib/db/prisma";
import { PublicPageStatus, ClubFlightIntentType, ClubFlightIntentStatus, ClubFlightIntentSource, ClubFlightIntentVisibility } from "../src/generated/prisma";

async function main() {
  console.log("Seeding database...");

  const efk87 = await prisma.club.upsert({
    where: { slug: "efk87" },
    update: {},
    create: {
      id: "efk87", // Using a stable ID for the first club
      name: "EFK87",
      slug: "efk87",
    },
  });

  await prisma.clubSettings.upsert({
    where: { clubId: efk87.id },
    update: {},
    create: {
      clubId: efk87.id,
      displayName: "EFK87",
      shortName: "EFK87",
      primaryDomain: null,
      publicEmail: null,
    },
  });

  await prisma.clubTheme.upsert({
    where: { clubId: efk87.id },
    update: {},
    create: {
      clubId: efk87.id,
      backgroundColor: "#0b1220",
      panelColor: "rgba(18, 27, 46, 0.86)",
      panelSoftColor: "rgba(255,255,255,0.035)",
      lineColor: "rgba(255,255,255,0.08)",
      textColor: "#edf2ff",
      mutedTextColor: "#aab7d4",
      accentColor: "#6ee7b7",
      accentColor2: "#7dd3fc",
      shadowValue: "0 20px 50px rgba(0,0,0,0.35)",
      radiusValue: "22px",
      heroImageUrl: null,
    },
  });

  // Seed public pages for EFK87
  const publicPages = [
    {
      slug: "about",
      title: "About EFK87",
      body: "Club profile content will be managed here.",
      status: PublicPageStatus.PUBLISHED,
    },
    {
      slug: "members",
      title: "Members",
      body: "Member access foundation will be added later.",
      status: PublicPageStatus.PUBLISHED,
    },
  ];

  for (const page of publicPages) {
    await prisma.publicPage.upsert({
      where: {
        clubId_slug: {
          clubId: efk87.id,
          slug: page.slug,
        },
      },
      update: {},
      create: {
        clubId: efk87.id,
        ...page,
      },
    });
  }

  // Seed feature tiles for EFK87
  const featureTiles = [
    {
      title: "Forum",
      description: "Følg dialogen i klubben, se nye tråde og del erfaringer om udstyr, ture og flyvning.",
      href: "/efk87/forum",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 10,
      isActive: true,
    },
    {
      title: "Galleri",
      description: "Se klubbens albums, seneste uploads og udvalgt aktivitet fra Facebook og Instagram.",
      href: "/efk87/galleri",
      imageUrl: "https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 20,
      isActive: true,
    },
    {
      title: "Flyveskole",
      description: "Find vej ind i sporten med instruktører, skolekalender og en enkel introduktion til forløbet.",
      href: "/efk87/flyveskole",
      imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 30,
      isActive: true,
    },
    {
      title: "Om EFK87",
      description: "Bestyrelse, regler, kontakt, vejvisning og de områder der kræver login som medlem.",
      href: "/efk87/about",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 40,
      isActive: true,
    },
  ];

  for (const tile of featureTiles) {
    // We use title as a simple way to identify tiles for idempotency in this seed
    // In a real scenario, we might want a slug or a stable ID if we had one.
    // For now, checking by clubId and title/href is enough for seed idempotency.
    const existingTile = await prisma.publicHomeFeatureTile.findFirst({
      where: {
        clubId: efk87.id,
        href: tile.href,
      },
    });

    if (existingTile) {
      await prisma.publicHomeFeatureTile.update({
        where: { id: existingTile.id },
        data: tile,
      });
    } else {
      await prisma.publicHomeFeatureTile.create({
        data: {
          clubId: efk87.id,
          ...tile,
        },
      });
    }
  }

  // Seed mockup-style active flight intents for EFK87
  // These are demo/homepage seed data
  // Current local date in this context is 2026-04-29
  const flightIntents = [
    {
      displayName: "René Severinsen",
      message: "Kommer ca. 11:15 med DG-800.",
      activityType: ClubFlightIntentType.FLYING,
      status: ClubFlightIntentStatus.ACTIVE,
      source: ClubFlightIntentSource.ADMIN_SEED,
      visibility: ClubFlightIntentVisibility.PUBLIC,
      flightDate: new Date("2026-04-29T00:00:00Z"),
      createdAt: new Date("2026-04-29T09:07:00Z"),
      plannedAt: new Date("2026-04-29T11:15:00Z"),
      expiresAt: new Date("2026-04-29T20:00:00Z"),
    },
    {
      displayName: "Lars Mikkelsen",
      message: "Er på pladsen fra 10:30. Tager lader med til 6S hvis nogen mangler.",
      activityType: ClubFlightIntentType.MAINTENANCE,
      status: ClubFlightIntentStatus.ACTIVE,
      source: ClubFlightIntentSource.ADMIN_SEED,
      visibility: ClubFlightIntentVisibility.PUBLIC,
      flightDate: new Date("2026-04-29T00:00:00Z"),
      createdAt: new Date("2026-04-29T08:48:00Z"),
      plannedAt: new Date("2026-04-29T10:30:00Z"),
      expiresAt: new Date("2026-04-29T20:00:00Z"),
    },
    {
      displayName: "Søren Østergaard",
      message: "Ser vinden an – hvis den holder sig under 6 m/s kommer jeg med skræntkassen.",
      activityType: ClubFlightIntentType.WEATHER_DEPENDENT,
      status: ClubFlightIntentStatus.ACTIVE,
      source: ClubFlightIntentSource.ADMIN_SEED,
      visibility: ClubFlightIntentVisibility.PUBLIC,
      flightDate: new Date("2026-04-29T00:00:00Z"),
      createdAt: new Date("2026-04-29T08:12:00Z"),
      plannedAt: new Date("2026-04-29T10:00:00Z"),
      expiresAt: new Date("2026-04-29T20:00:00Z"),
    },
    {
      displayName: "Erik Jensen",
      message: "Planlægger flyvning i morgen tidlig.",
      activityType: ClubFlightIntentType.FLYING,
      status: ClubFlightIntentStatus.ACTIVE,
      source: ClubFlightIntentSource.ADMIN_SEED,
      visibility: ClubFlightIntentVisibility.PUBLIC,
      flightDate: new Date("2026-04-30T00:00:00Z"),
      createdAt: new Date("2026-04-29T14:00:00Z"),
      plannedAt: new Date("2026-04-30T09:00:00Z"),
      expiresAt: new Date("2026-04-30T18:00:00Z"),
    },
  ];

  for (const intent of flightIntents) {
    const existingIntent = await prisma.clubFlightIntent.findFirst({
      where: {
        clubId: efk87.id,
        displayName: intent.displayName,
        flightDate: intent.flightDate,
      },
    });

    if (existingIntent) {
      await prisma.clubFlightIntent.update({
        where: { id: existingIntent.id },
        data: intent,
      });
    } else {
      await prisma.clubFlightIntent.create({
        data: {
          clubId: efk87.id,
          ...intent,
        },
      });
    }
  }

  // Seed public home info cards for EFK87
  const homeInfoCards = [
    {
      title: "Skoleflyvning i dag",
      body: "Skoleflyvningen er aktiv fra kl. 11:00. Brug bane 2 til elevstarter frem til middag. Poul Andersen og Lars Mortensen er på pladsen.",
      badge1: "4 elever tilmeldt",
      badge2: "2 instruktører",
      badge3: null,
      sortOrder: 10,
      isActive: true,
    },
    {
      title: "Næste aktiviteter",
      body: "Klubåbning og kaffe kl. 10:30 · Skoleflyvning kl. 11:00 · Bestyrelsesmøde onsdag kl. 19:00 · Forårsoprydning lørdag kl. 09:30.",
      badge1: "Kalender",
      badge2: "Live fra admin",
      badge3: null,
      sortOrder: 20,
      isActive: true,
    },
  ];

  for (const card of homeInfoCards) {
    const existingCard = await prisma.publicHomeInfoCard.findFirst({
      where: {
        clubId: efk87.id,
        title: card.title,
      },
    });

    if (existingCard) {
      await prisma.publicHomeInfoCard.update({
        where: { id: existingCard.id },
        data: card,
      });
    } else {
      await prisma.publicHomeInfoCard.create({
        data: {
          clubId: efk87.id,
          ...card,
        },
      });
    }
  }

  console.log({ efk87 });
  console.log("Seed finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
