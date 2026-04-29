#!/usr/bin/env node
// =============================================================================
// Acadivo Database Seed Script
// =============================================================================
// Placeholder — will be fully implemented by the DB_Architect.
// This script populates the database with initial data for development.
// =============================================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Placeholder seed logic
  console.log('⚠️  Seed script is a placeholder.');
  console.log('   Full implementation will be provided by the DB_Architect.');

  // Example: create an admin user
  // const admin = await prisma.user.upsert({
  //   where: { email: 'admin@acadivo.com' },
  //   update: {},
  //   create: {
  //     email: 'admin@acadivo.com',
  //     name: 'System Admin',
  //     role: 'ADMIN',
  //   },
  // });
  // console.log(`Created admin user: ${admin.email}`);

  console.log('✅ Seed complete (placeholder).');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
