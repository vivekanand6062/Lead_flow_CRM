const { PrismaClient } = require('@prisma/client');

// Global PrismaClient singleton for LeadFlow CRM
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn']
  });
} else {
  if (!global.__leadflow_prisma) {
    global.__leadflow_prisma = new PrismaClient({
      log: ['error', 'warn']
    });
  }
  prisma = global.__leadflow_prisma;
}

module.exports = prisma;
