import prisma from "../src/lib/db/prisma";
import { PublicPageStatus } from "../src/generated/prisma";

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
