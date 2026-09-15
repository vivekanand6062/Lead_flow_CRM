const prisma = require('./prisma');

const connectDB = async () => {
  try {
    await prisma.$connect();
    const dbUrl = process.env.DATABASE_URL || '';
    const safeUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
    console.log(`[PostgreSQL] Successfully connected via Prisma to: ${safeUrl}`);
  } catch (error) {
    console.error('[PostgreSQL] Failed to connect to database:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

module.exports = { connectDB, disconnectDB, prisma };
