"use server";

import prisma from "../db/prisma";

export async function seedCalendarEntries(clubId: string) {
  const now = new Date();
  
  const entries = [
    {
      title: "Byggemøde",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 19, 0),
      location: "Klubhuset",
      isPublished: true,
      forceShowInMarquee: false,
    },
    {
      title: "Indendørs flyvning – Solvanghallen 18:00",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 18, 0),
      location: "Solvanghallen",
      isPublished: true,
      forceShowInMarquee: true,
    },
    {
      title: "Generalforsamling – 25. november",
      startsAt: new Date(2026, 10, 25, 19, 0), // 25. Nov 2026
      location: "Klubhuset",
      isPublished: true,
      forceShowInMarquee: false,
    },
    {
      title: "Standerstrygning – 25. oktober",
      startsAt: new Date(2026, 9, 25, 14, 0), // 25. Okt 2026
      location: "Pladsen",
      isPublished: true,
      forceShowInMarquee: false,
    }
  ];

  for (const entry of entries) {
    await prisma.clubCalendarEntry.create({
      data: {
        ...entry,
        clubId,
        descriptionHtml: `<p>Dette er et automatisk genereret kalenderindslag for ${entry.title}.</p><p>Velkommen til!</p>`,
      }
    });
  }
}
