import prisma from "../src/lib/db/prisma";
import { 
  PublicPageStatus, 
  PublicSurfaceVisibility,
  ClubMailingListPurpose,
  GalleryAlbumStatus,
  GalleryImageStatus,
  ArticleStatus
} from "../src/generated/prisma";

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
    {
      slug: "galleri",
      title: "Galleri",
      body: "Her kommer klubbens billeder og visuelle liv senere.",
      status: PublicPageStatus.PUBLISHED,
    },
    {
      slug: "flyveskole",
      title: "Flyveskole",
      body: "Her kommer information om flyveskole, instruktører og vejen ind i modelflyvning.",
      status: PublicPageStatus.PUBLISHED,
    },
    {
      slug: "bliv-medlem",
      title: "Bliv medlem",
      body: "Her kommer information om medlemskab, kontingent og hvordan man bliver en del af EFK87.",
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

  // Article Tags
  const tags = [
    { slug: "skraentflyvning", name: "Skræntflyvning" },
    { slug: "gps", name: "GPS" },
    { slug: "weekendtur", name: "Weekendtur" },
    { slug: "pladsen", name: "Pladsen" },
  ];

  for (const tag of tags) {
    await prisma.articleTag.upsert({
      where: { clubId_slug: { clubId: efk87.id, slug: tag.slug } },
      update: tag,
      create: { ...tag, clubId: efk87.id },
    });
  }

  // Articles (Sample data only if in development)
  if (process.env.APP_ENV === "development") {
    const samples = [
      {
        slug: "weekend-paa-skraenten",
        title: "Weekend på skrænten gav både vind, grin og gode starter.",
        excerpt: "Lørdagens tur til skrænten blev en af de dage, hvor det hele gik op i en højere enhed. Vinden holdt, solen brød igennem.",
        body: "<p>Lørdagens tur til skrænten blev en af de dage, hvor det hele gik op i en højere enhed. Vinden holdt, solen brød igennem, og både erfarne piloter og nyere medlemmer fik masser af tid i luften.</p><p>Artiklen samler billeder, erfaringer og et par læringer, der er værd at tage med videre.</p>",
        heroImageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
        status: ArticleStatus.PUBLISHED,
        visibility: PublicSurfaceVisibility.PUBLIC,
        isFeatured: true,
        authorName: "Jesper Holm",
        publishedAt: new Date("2026-03-27"),
      },
      {
        slug: "nyt-gps-triangle-setup",
        title: "Nyt GPS-triangle setup til sæson 2026",
        excerpt: "En praktisk gennemgang af årets setup, hvad der virker bedre end sidste sæson.",
        body: "<p>En praktisk gennemgang af årets setup, hvad der virker bedre end sidste sæson, og hvor vi stadig skal være skarpe på procedurerne.</p>",
        heroImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        status: ArticleStatus.PUBLISHED,
        visibility: PublicSurfaceVisibility.PUBLIC,
        authorName: "René Severinsen",
        publishedAt: new Date("2026-03-24"),
      }
    ];

    for (const s of samples) {
      const article = await prisma.article.upsert({
        where: { clubId_slug: { clubId: efk87.id, slug: s.slug } },
        update: s,
        create: { ...s, clubId: efk87.id },
      });

      // Assign tags to sample articles
      if (s.slug === "weekend-paa-skraenten") {
        const tag = await prisma.articleTag.findFirst({ where: { clubId: efk87.id, slug: "skraentflyvning" } });
        if (tag) {
          await prisma.articleTagAssignment.upsert({
            where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
            update: {},
            create: { articleId: article.id, tagId: tag.id }
          });
        }
      }
      if (s.slug === "nyt-gps-triangle-setup") {
        const tag = await prisma.articleTag.findFirst({ where: { clubId: efk87.id, slug: "gps" } });
        if (tag) {
          await prisma.articleTagAssignment.upsert({
            where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
            update: {},
            create: { articleId: article.id, tagId: tag.id }
          });
        }
      }
    }
  }

  // Seed local development test member
  // ONLY for development environment
  if (process.env.APP_ENV === "development") {
    console.log("Seeding development test member...");
    const testMember = await prisma.user.upsert({
      where: { email: "test.member@efk87.local" },
      update: {},
      create: {
        email: "test.member@efk87.local",
        name: "Test Member",
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.memberDailyActivity.upsert({
      where: {
        clubId_userId_activityDate: {
          clubId: efk87.id,
          userId: testMember.id,
          activityDate: today,
        },
      },
      update: {
        lastSeenAt: new Date(new Date().getTime() - 1000 * 60 * 15),
      },
      create: {
        clubId: efk87.id,
        userId: testMember.id,
        activityDate: today,
        firstSeenAt: new Date(new Date().getTime() - 1000 * 60 * 60),
        lastSeenAt: new Date(new Date().getTime() - 1000 * 60 * 15),
      },
    });

    await prisma.clubMembership.upsert({
      where: {
        clubId_userId: {
          clubId: efk87.id,
          userId: testMember.id,
        },
      },
      update: {
        status: "ACTIVE",
        role: "MEMBER",
      },
      create: {
        clubId: efk87.id,
        userId: testMember.id,
        status: "ACTIVE",
        role: "MEMBER",
      },
    });

    console.log("Seeding development admin member...");
    const adminMember = await prisma.user.upsert({
      where: { email: "admin@efk87.local" },
      update: {},
      create: {
        email: "admin@efk87.local",
        name: "Test Admin",
      },
    });

    await prisma.memberDailyActivity.upsert({
      where: {
        clubId_userId_activityDate: {
          clubId: efk87.id,
          userId: adminMember.id,
          activityDate: today,
        },
      },
      update: {
        lastSeenAt: new Date(new Date().getTime() - 1000 * 60 * 5),
      },
      create: {
        clubId: efk87.id,
        userId: adminMember.id,
        activityDate: today,
        firstSeenAt: new Date(new Date().getTime() - 1000 * 60 * 30),
        lastSeenAt: new Date(new Date().getTime() - 1000 * 60 * 5),
      },
    });

    await prisma.clubMembership.upsert({
      where: {
        clubId_userId: {
          clubId: efk87.id,
          userId: adminMember.id,
        },
      },
      update: {
        status: "ACTIVE",
        role: "ADMIN",
      },
      create: {
        clubId: efk87.id,
        userId: adminMember.id,
        status: "ACTIVE",
        role: "ADMIN",
      },
    });

    console.log("Development members seeded.");
  } else {
    console.log(`Skipping development members seed (APP_ENV: ${process.env.APP_ENV || 'not set'})`);
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
      visibility: PublicSurfaceVisibility.PUBLIC,
    },
    {
      title: "Galleri",
      description: "Se klubbens albums, seneste uploads og udvalgt aktivitet fra Facebook og Instagram.",
      href: "/efk87/galleri",
      imageUrl: "https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 20,
      isActive: true,
      visibility: PublicSurfaceVisibility.PUBLIC,
    },
    {
      title: "Flyveskole",
      description: "Find vej ind i sporten med instruktører, skolekalender og en enkel introduktion til forløbet.",
      href: "/efk87/flyveskole",
      imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 30,
      isActive: true,
      visibility: PublicSurfaceVisibility.PUBLIC,
    },
    {
      title: "Om EFK87",
      description: "Bestyrelse, regler, kontakt, vejvisning og de områder der kræver login som medlem.",
      href: "/efk87/about",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      sortOrder: 40,
      isActive: true,
      visibility: PublicSurfaceVisibility.PUBLIC,
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

  // Seed public home info cards for EFK87
  await prisma.user.upsert({
    where: { email: "admin@efk87.local" },
    update: {},
    create: {
      email: "admin@efk87.local",
      name: "Test Admin",
    },
  });

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
      visibility: PublicSurfaceVisibility.PUBLIC,
    },
    {
      title: "Næste aktiviteter",
      body: "Klubåbning og kaffe kl. 10:30 · Skoleflyvning kl. 11:00 · Bestyrelsesmøde onsdag kl. 19:00 · Forårsoprydning lørdag kl. 09:30.",
      badge1: "Kalender",
      badge2: "Live fra admin",
      badge3: null,
      sortOrder: 20,
      isActive: true,
      visibility: PublicSurfaceVisibility.PUBLIC,
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

  // Seed public club footer for EFK87
  const footerData = {
    description: "Ny forside mockup med mere visuel struktur og tydeligere indgange til de vigtigste områder: aktivitet, forum, galleri, flyveskole og klubinformation.",
    addressLine1: "EFK87",
    addressLine2: "Flyvestation Værløse, Shelter 331, 3500 Værløse",
    email: "kontakt@efk87.dk",
    phone: null,
    cvr: "12345678",
  };

  await prisma.publicClubFooter.upsert({
    where: { clubId: efk87.id },
    update: footerData,
    create: {
      clubId: efk87.id,
      ...footerData,
    },
  });

  // Seed public sponsors for EFK87
  const sponsors = [
    {
      name: "Ellehammerfonden",
      href: null,
      sortOrder: 10,
      isActive: true,
    },
    {
      name: "Friluftsrådet",
      href: null,
      sortOrder: 20,
      isActive: true,
    },
    {
      name: "Dane-RC",
      href: null,
      sortOrder: 30,
      isActive: true,
    },
  ];

  for (const sponsor of sponsors) {
    const existingSponsor = await prisma.publicSponsor.findFirst({
      where: {
        clubId: efk87.id,
        name: sponsor.name,
      },
    });

    if (existingSponsor) {
      await prisma.publicSponsor.update({
        where: { id: existingSponsor.id },
        data: sponsor,
      });
    } else {
      await prisma.publicSponsor.create({
        data: {
          clubId: efk87.id,
          ...sponsor,
        },
      });
    }
  }

  // Seed mailing lists for EFK87
  const mailingLists = [
    {
      key: "general",
      name: "EFK87",
      purpose: ClubMailingListPurpose.GENERAL,
      emailAddress: "efk87@efk87.dk",
      isActive: true,
    },
    {
      key: "flight-intents",
      name: "Flyvermeddelelser",
      purpose: ClubMailingListPurpose.FLIGHT_INTENT,
      emailAddress: "website@efk87.dk",
      isActive: true,
    },
  ];

  for (const list of mailingLists) {
    await prisma.clubMailingList.upsert({
      where: {
        clubId_key: {
          clubId: efk87.id,
          key: list.key,
        },
      },
      update: list,
      create: {
        clubId: efk87.id,
        ...list,
      },
    });
  }

  // Seed Gallery for EFK87
  if (process.env.APP_ENV === "development") {
    console.log("Seeding development gallery sample...");
    
    const galleryAlbums = [
      {
        slug: "sommer-2025",
        title: "Sommer flyvning 2025",
        description: "Billeder fra en fantastisk sommer på pladsen.",
        coverImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
        status: GalleryAlbumStatus.PUBLISHED,
        visibility: PublicSurfaceVisibility.PUBLIC,
        sortOrder: 1,
        publishedAt: new Date(),
        images: [
          {
            title: "Morgenflyvning",
            caption: "Klar til start i den tidlige morgensol.",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
            status: GalleryImageStatus.ACTIVE,
            sortOrder: 1,
          },
          {
            title: "Landing",
            caption: "Perfekt landing på bane 2.",
            imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
            status: GalleryImageStatus.ACTIVE,
            sortOrder: 2,
          }
        ]
      },
      {
        slug: "klubaften-maj",
        title: "Klubaften Maj",
        description: "Hygge og teknik i shelteren.",
        coverImageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
        status: GalleryAlbumStatus.PUBLISHED,
        visibility: PublicSurfaceVisibility.PUBLIC,
        sortOrder: 2,
        publishedAt: new Date(),
        images: [
          {
            title: "Tekniksnak",
            caption: "Nye motorer bliver diskuteret.",
            imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
            status: GalleryImageStatus.ACTIVE,
            sortOrder: 1,
          }
        ]
      },
      {
        slug: "medlems-album",
        title: "Kun for medlemmer",
        description: "Dette album er kun synligt for medlemmer.",
        coverImageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
        status: GalleryAlbumStatus.PUBLISHED,
        visibility: PublicSurfaceVisibility.MEMBERS_ONLY,
        sortOrder: 3,
        publishedAt: new Date(),
        images: [
          {
            title: "Hemmelig testflyvning",
            caption: "Nyt projekt under udvikling.",
            imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
            status: GalleryImageStatus.ACTIVE,
            sortOrder: 1,
          }
        ]
      }
    ];

    for (const albumData of galleryAlbums) {
      const { images, ...albumInfo } = albumData;
      const album = await prisma.galleryAlbum.upsert({
        where: {
          clubId_slug: {
            clubId: efk87.id,
            slug: albumInfo.slug,
          },
        },
        update: albumInfo,
        create: {
          clubId: efk87.id,
          ...albumInfo,
        },
      });

      for (const imageData of images) {
        const existingImage = await prisma.galleryImage.findFirst({
          where: {
            clubId: efk87.id,
            albumId: album.id,
            imageUrl: imageData.imageUrl,
          },
        });

        if (!existingImage) {
          await prisma.galleryImage.create({
            data: {
              clubId: efk87.id,
              albumId: album.id,
              ...imageData,
            },
          });
        }
      }
    }
    console.log("Gallery samples seeded.");
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
