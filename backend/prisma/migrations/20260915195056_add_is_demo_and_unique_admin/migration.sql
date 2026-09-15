-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "organizations_isDemo_setupCompleted_idx" ON "organizations"("isDemo", "setupCompleted");

-- Partial Unique Index ensuring exactly ONE ADMIN per organization
CREATE UNIQUE INDEX IF NOT EXISTS "unique_admin_per_org" ON "users" ("organizationId") WHERE role = 'ADMIN';

-- Mark existing Demo organization as isDemo = true
UPDATE "organizations" SET "isDemo" = true WHERE "name" = 'LeadFlow Technologies' OR "email" = 'contact@leadflow.com';
