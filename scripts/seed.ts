import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database...");

  await prisma.organization.upsert({
    where: { id: "org_default" },
    update: {},
    create: {
      id: "org_default",
      name: "Default Company",
      slug: "default",
    },
  });

  const categories = [
    { id: "cat_billing", name: "Billing" },
    { id: "cat_technical", name: "Technical Issue" },
    { id: "cat_account", name: "Account" },
    { id: "cat_feature", name: "Feature Request" },
    { id: "cat_other", name: "Other" },
  ];

  for (const cat of categories) {
    await prisma.ticketCategory.upsert({
      where: { id: cat.id },
      update: { name: cat.name },
      create: {
        id: cat.id,
        name: cat.name,
        tenantId: "org_default",
      },
    });
  }

  await prisma.ticketNumberCounter.upsert({
    where: { id: "org_default" },
    update: {},
    create: {
      id: "org_default",
      currentValue: 0,
    },
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
