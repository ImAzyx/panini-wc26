import { prisma } from "@/lib/db";

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE "Collection"
    SET "stickerId" = 'CUW' || SUBSTRING("stickerId" FROM 4)
    WHERE "stickerId" LIKE 'CUR%'
  `;
  console.log(`Migrated ${result} Collection row(s) from CUR* to CUW*.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
