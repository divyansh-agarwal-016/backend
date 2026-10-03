// TO RUN: npx tsx src/seed.ts

import prisma from "./config/db.js";

const developers = Array.from({ length: 150 }, (_, i) => ({
  username: `developer${i + 1}`,
  score: 1500 - i * 7,
}));

async function seed() {
  await prisma.developer.deleteMany();

  await prisma.developer.createMany({
    data: developers,
  });

  console.log("150 developers inserted successfully");
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });