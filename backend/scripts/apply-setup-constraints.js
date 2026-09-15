const prisma = require('../config/prisma');

async function main() {
  console.log('[Setup Constraints] Creating partial unique index for single Admin per organization...');
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "unique_admin_per_org" 
    ON "users" ("organizationId") 
    WHERE role = 'ADMIN';
  `);
  console.log('[Setup Constraints] Partial unique index created successfully.');

  console.log('[Setup Constraints] Marking Demo Organization as isDemo = true...');
  const updateResult = await prisma.organization.updateMany({
    where: {
      name: 'LeadFlow Technologies'
    },
    data: {
      isDemo: true
    }
  });
  console.log(`[Setup Constraints] Updated ${updateResult.count} Demo organization(s).`);

  const orgs = await prisma.organization.findMany();
  console.log('[Setup Constraints] Current Organizations in DB:', orgs);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('[Setup Constraints] Fatal error:', err);
    process.exit(1);
  });
