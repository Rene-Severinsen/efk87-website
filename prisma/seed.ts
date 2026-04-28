import prisma from "../src/lib/db/prisma";

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
