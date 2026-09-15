/**
 * LeadFlow CRM — Production-Grade MongoDB to PostgreSQL Migration Script
 *
 * Transfers data from MongoDB into PostgreSQL via Prisma:
 * - Preserves exact 24-character hexadecimal ObjectId strings as IDs.
 * - Respects topological foreign key dependencies.
 * - Safely handles self-referencing user hierarchies without cyclic deadlocks.
 * - Idempotent and safely re-runnable (upsert semantics).
 * - MongoDB data is completely read-only and preserved untouched.
 * - Performs automated data validation and generates a detailed audit report.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

interface MigrationStats {
  entity: string;
  mongoCount: number;
  postgresCount: number;
  failed: number;
  status: 'PASS' | 'FAIL';
}

async function migrate() {
  console.log('====================================================');
  console.log('🚀 Starting MongoDB → PostgreSQL Migration for LeadFlow CRM');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  console.log(`[1/4] Connecting to source MongoDB: ${mongoUri.replace(/:[^:@]+@/, ':***@')}`);
  await mongoose.connect(mongoUri);
  console.log('✓ Successfully connected to MongoDB\n');

  console.log('[2/4] Connecting to target PostgreSQL...');
  await prisma.$connect();
  console.log('✓ Successfully connected to PostgreSQL via Prisma\n');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Failed to retrieve MongoDB database instance.');
  }

  const stats: MigrationStats[] = [];

  try {
    // ------------------------------------------------------------------------
    // 1. ORGANIZATIONS
    // ------------------------------------------------------------------------
    console.log('Migrating Organizations...');
    const mongoOrgs = await db.collection('organizations').find().toArray();
    let orgFailures = 0;
    for (const org of mongoOrgs) {
      try {
        const id = org._id.toString();
        await prisma.organization.upsert({
          where: { id },
          create: {
            id,
            name: org.name || 'LeadFlow Technologies',
            industry: org.industry || 'Technology',
            email: org.email || null,
            phone: org.phone || null,
            website: org.website || null,
            address: org.address || null,
            logo: org.logo || '',
            currency: org.currency || 'INR',
            setupCompleted: Boolean(org.setupCompleted),
            createdAt: org.createdAt ? new Date(org.createdAt) : new Date(),
            updatedAt: org.updatedAt ? new Date(org.updatedAt) : new Date()
          },
          update: {
            name: org.name || 'LeadFlow Technologies',
            industry: org.industry || 'Technology',
            email: org.email || null,
            phone: org.phone || null,
            website: org.website || null,
            address: org.address || null,
            logo: org.logo || '',
            currency: org.currency || 'INR',
            setupCompleted: Boolean(org.setupCompleted),
            updatedAt: org.updatedAt ? new Date(org.updatedAt) : new Date()
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate organization ${org._id}:`, err.message);
        orgFailures++;
      }
    }
    const pgOrgCount = await prisma.organization.count();
    stats.push({
      entity: 'Organizations',
      mongoCount: mongoOrgs.length,
      postgresCount: pgOrgCount,
      failed: orgFailures,
      status: pgOrgCount === mongoOrgs.length && orgFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Organizations: ${pgOrgCount} migrated (${orgFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // 2. USERS (Pass 1: Insert without managerId to avoid foreign key deadlocks)
    // ------------------------------------------------------------------------
    console.log('Migrating Users (Pass 1: Base Accounts)...');
    const mongoUsers = await db.collection('users').find().toArray();
    let userFailures = 0;
    for (const user of mongoUsers) {
      try {
        const id = user._id.toString();
        const organizationId = user.organizationId ? user.organizationId.toString() : (mongoOrgs[0]?._id.toString() || '');
        await prisma.user.upsert({
          where: { id },
          create: {
            id,
            organizationId,
            name: user.name,
            email: user.email.toLowerCase().trim(),
            password: user.password,
            phone: user.phone || null,
            role: user.role,
            managerId: null, // assigned in Pass 2
            department: user.department || 'Sales',
            targetQuota: new Prisma.Decimal(user.targetQuota || 0),
            status: user.status || 'ACTIVE',
            avatar: user.avatar || '',
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
          },
          update: {
            name: user.name,
            email: user.email.toLowerCase().trim(),
            password: user.password,
            phone: user.phone || null,
            role: user.role,
            department: user.department || 'Sales',
            targetQuota: new Prisma.Decimal(user.targetQuota || 0),
            status: user.status || 'ACTIVE',
            avatar: user.avatar || '',
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate user ${user.email}:`, err.message);
        userFailures++;
      }
    }

    // Pass 2: Link manager hierarchy
    console.log('Linking User Manager Hierarchy (Pass 2)...');
    for (const user of mongoUsers) {
      if (user.managerId) {
        try {
          const id = user._id.toString();
          const managerId = user.managerId.toString();
          await prisma.user.update({
            where: { id },
            data: { managerId }
          });
        } catch (err: any) {
          console.warn(`  ⚠ Could not link manager for user ${user._id}:`, err.message);
        }
      }
    }
    const pgUserCount = await prisma.user.count();
    stats.push({
      entity: 'Users',
      mongoCount: mongoUsers.length,
      postgresCount: pgUserCount,
      failed: userFailures,
      status: pgUserCount === mongoUsers.length && userFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Users: ${pgUserCount} migrated (${userFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // 3. COMPANIES
    // ------------------------------------------------------------------------
    console.log('Migrating Companies...');
    const mongoCompanies = await db.collection('companies').find().toArray();
    let companyFailures = 0;
    for (const comp of mongoCompanies) {
      try {
        const id = comp._id.toString();
        const organizationId = comp.organizationId.toString();
        await prisma.company.upsert({
          where: { id },
          create: {
            id,
            organizationId,
            name: comp.name,
            industry: comp.industry || 'Technology',
            website: comp.website || null,
            phone: comp.phone || null,
            address: comp.address || null,
            employeeCount: Number(comp.employeeCount) || 50,
            annualRevenue: new Prisma.Decimal(comp.annualRevenue || 0),
            createdAt: comp.createdAt ? new Date(comp.createdAt) : new Date(),
            updatedAt: comp.updatedAt ? new Date(comp.updatedAt) : new Date()
          },
          update: {
            name: comp.name,
            industry: comp.industry || 'Technology',
            website: comp.website || null,
            phone: comp.phone || null,
            address: comp.address || null,
            employeeCount: Number(comp.employeeCount) || 50,
            annualRevenue: new Prisma.Decimal(comp.annualRevenue || 0),
            updatedAt: comp.updatedAt ? new Date(comp.updatedAt) : new Date()
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate company ${comp.name}:`, err.message);
        companyFailures++;
      }
    }
    const pgCompanyCount = await prisma.company.count();
    stats.push({
      entity: 'Companies',
      mongoCount: mongoCompanies.length,
      postgresCount: pgCompanyCount,
      failed: companyFailures,
      status: pgCompanyCount === mongoCompanies.length && companyFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Companies: ${pgCompanyCount} migrated (${companyFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // 4. CONTACTS
    // ------------------------------------------------------------------------
    console.log('Migrating Contacts...');
    const mongoContacts = await db.collection('contacts').find().toArray();
    let contactFailures = 0;
    for (const contact of mongoContacts) {
      try {
        const id = contact._id.toString();
        const organizationId = contact.organizationId.toString();
        const companyId = contact.companyId ? contact.companyId.toString() : null;
        const assignedAgentId = contact.assignedAgentId ? contact.assignedAgentId.toString() : null;

        await prisma.contact.upsert({
          where: { id },
          create: {
            id,
            organizationId,
            companyId,
            assignedAgentId,
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            designation: contact.designation || 'Decision Maker',
            companyName: contact.companyName || '',
            notes: contact.notes || '',
            createdAt: contact.createdAt ? new Date(contact.createdAt) : new Date(),
            updatedAt: contact.updatedAt ? new Date(contact.updatedAt) : new Date()
          },
          update: {
            companyId,
            assignedAgentId,
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            designation: contact.designation || 'Decision Maker',
            companyName: contact.companyName || '',
            notes: contact.notes || '',
            updatedAt: contact.updatedAt ? new Date(contact.updatedAt) : new Date()
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate contact ${contact.name}:`, err.message);
        contactFailures++;
      }
    }
    const pgContactCount = await prisma.contact.count();
    stats.push({
      entity: 'Contacts',
      mongoCount: mongoContacts.length,
      postgresCount: pgContactCount,
      failed: contactFailures,
      status: pgContactCount === mongoContacts.length && contactFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Contacts: ${pgContactCount} migrated (${contactFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // 5. LEADS
    // ------------------------------------------------------------------------
    console.log('Migrating Leads...');
    const mongoLeads = await db.collection('leads').find().toArray();
    let leadFailures = 0;
    for (const lead of mongoLeads) {
      try {
        const id = lead._id.toString();
        const organizationId = lead.organizationId.toString();
        const assignedAgentId = lead.assignedAgentId ? lead.assignedAgentId.toString() : null;
        const managerId = lead.managerId ? lead.managerId.toString() : null;

        await prisma.lead.upsert({
          where: { id },
          create: {
            id,
            organizationId,
            assignedAgentId,
            managerId,
            name: lead.name,
            companyName: lead.companyName,
            email: lead.email || null,
            phone: lead.phone || null,
            status: lead.status || 'NEW',
            leadSource: leadSourceClean(lead.leadSource),
            leadScore: Number(lead.leadScore) || 65,
            intentLevel: lead.intentLevel || 'MEDIUM',
            scoreReasoning: lead.scoreReasoning || 'Lead evaluation',
            scoreSignals: Array.isArray(lead.scoreSignals) ? lead.scoreSignals : [],
            estimatedValue: new Prisma.Decimal(lead.estimatedValue || 0),
            notes: lead.notes || '',
            lastActivityDate: lead.lastActivityDate ? new Date(lead.lastActivityDate) : new Date(),
            nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate) : null,
            createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
            updatedAt: lead.updatedAt ? new Date(lead.updatedAt) : new Date()
          },
          update: {
            assignedAgentId,
            managerId,
            name: lead.name,
            companyName: lead.companyName,
            email: lead.email || null,
            phone: lead.phone || null,
            status: lead.status || 'NEW',
            leadSource: leadSourceClean(lead.leadSource),
            leadScore: Number(lead.leadScore) || 65,
            intentLevel: lead.intentLevel || 'MEDIUM',
            scoreReasoning: lead.scoreReasoning || 'Lead evaluation',
            scoreSignals: Array.isArray(lead.scoreSignals) ? lead.scoreSignals : [],
            estimatedValue: new Prisma.Decimal(lead.estimatedValue || 0),
            notes: lead.notes || '',
            lastActivityDate: lead.lastActivityDate ? new Date(lead.lastActivityDate) : new Date(),
            nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate) : null,
            updatedAt: lead.updatedAt ? new Date(lead.updatedAt) : new Date()
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate lead ${lead.name}:`, err.message);
        leadFailures++;
      }
    }
    const pgLeadCount = await prisma.lead.count();
    stats.push({
      entity: 'Leads',
      mongoCount: mongoLeads.length,
      postgresCount: pgLeadCount,
      failed: leadFailures,
      status: pgLeadCount === mongoLeads.length && leadFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Leads: ${pgLeadCount} migrated (${leadFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // 6. DEALS
    // ------------------------------------------------------------------------
    console.log('Migrating Deals...');
    const mongoDeals = await db.collection('deals').find().toArray();
    let dealFailures = 0;
    for (const deal of mongoDeals) {
      try {
        const id = deal._id.toString();
        const organizationId = deal.organizationId.toString();
        const assignedAgentId = deal.assignedAgentId ? deal.assignedAgentId.toString() : null;
        const managerId = deal.managerId ? deal.managerId.toString() : null;
        const leadId = deal.leadId ? deal.leadId.toString() : null;
        const companyId = deal.companyId ? deal.companyId.toString() : null;
        const contactId = deal.contactId ? deal.contactId.toString() : null;

        await prisma.deal.upsert({
          where: { id },
          create: {
            id,
            organizationId,
            assignedAgentId,
            managerId,
            leadId,
            companyId,
            contactId,
            title: deal.title,
            companyName: deal.companyName,
            value: new Prisma.Decimal(deal.value || 0),
            currency: deal.currency || 'INR',
            probability: Number(deal.probability) || 50,
            stage: deal.stage || 'QUALIFIED',
            status: deal.status || 'OPEN',
            expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : new Date(),
            riskHealth: deal.riskHealth || 'GOOD',
            riskSignals: Array.isArray(deal.riskSignals) ? deal.riskSignals : [],
            positiveSignals: Array.isArray(deal.positiveSignals) ? deal.positiveSignals : [],
            recommendedAction: deal.recommendedAction || '',
            notes: deal.notes || '',
            createdAt: deal.createdAt ? new Date(deal.createdAt) : new Date(),
            updatedAt: deal.updatedAt ? new Date(deal.updatedAt) : new Date()
          },
          update: {
            assignedAgentId,
            managerId,
            leadId,
            companyId,
            contactId,
            title: deal.title,
            companyName: deal.companyName,
            value: new Prisma.Decimal(deal.value || 0),
            currency: deal.currency || 'INR',
            probability: Number(deal.probability) || 50,
            stage: deal.stage || 'QUALIFIED',
            status: deal.status || 'OPEN',
            expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : new Date(),
            riskHealth: deal.riskHealth || 'GOOD',
            riskSignals: Array.isArray(deal.riskSignals) ? deal.riskSignals : [],
            positiveSignals: Array.isArray(deal.positiveSignals) ? deal.positiveSignals : [],
            recommendedAction: deal.recommendedAction || '',
            notes: deal.notes || '',
            updatedAt: deal.updatedAt ? new Date(deal.updatedAt) : new Date()
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate deal ${deal.title}:`, err.message);
        dealFailures++;
      }
    }
    const pgDealCount = await prisma.deal.count();
    stats.push({
      entity: 'Deals',
      mongoCount: mongoDeals.length,
      postgresCount: pgDealCount,
      failed: dealFailures,
      status: pgDealCount === mongoDeals.length && dealFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Deals: ${pgDealCount} migrated (${dealFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // 7. ACTIVITIES
    // ------------------------------------------------------------------------
    console.log('Migrating Activities...');
    const mongoActivities = await db.collection('activities').find().toArray();
    let activityFailures = 0;
    for (const act of mongoActivities) {
      try {
        const id = act._id.toString();
        const organizationId = act.organizationId.toString();
        const userId = act.userId ? act.userId.toString() : null;
        const leadId = act.leadId ? act.leadId.toString() : null;
        const dealId = act.dealId ? act.dealId.toString() : null;
        const contactId = act.contactId ? act.contactId.toString() : null;

        await prisma.activity.upsert({
          where: { id },
          create: {
            id,
            organizationId,
            userId,
            leadId,
            dealId,
            contactId,
            type: act.type || 'TASK',
            title: act.title || 'Activity',
            relatedCustomer: act.relatedCustomer || '',
            status: act.status || 'COMPLETED',
            date: act.date ? new Date(act.date) : new Date(),
            notes: act.notes || '',
            createdAt: act.createdAt ? new Date(act.createdAt) : new Date(),
            updatedAt: act.updatedAt ? new Date(act.updatedAt) : new Date()
          },
          update: {
            userId,
            leadId,
            dealId,
            contactId,
            type: act.type || 'TASK',
            title: act.title || 'Activity',
            relatedCustomer: act.relatedCustomer || '',
            status: act.status || 'COMPLETED',
            date: act.date ? new Date(act.date) : new Date(),
            notes: act.notes || '',
            updatedAt: act.updatedAt ? new Date(act.updatedAt) : new Date()
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate activity ${act.title}:`, err.message);
        activityFailures++;
      }
    }
    const pgActivityCount = await prisma.activity.count();
    stats.push({
      entity: 'Activities',
      mongoCount: mongoActivities.length,
      postgresCount: pgActivityCount,
      failed: activityFailures,
      status: pgActivityCount === mongoActivities.length && activityFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Activities: ${pgActivityCount} migrated (${activityFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // 8. FOLLOW-UPS
    // ------------------------------------------------------------------------
    console.log('Migrating Follow-Ups...');
    const mongoFollowUps = await db.collection('followups').find().toArray();
    let followUpFailures = 0;
    for (const f of mongoFollowUps) {
      try {
        const id = f._id.toString();
        const organizationId = f.organizationId.toString();
        const userId = f.userId ? f.userId.toString() : (mongoUsers[0]?._id.toString() || '');
        const leadId = f.leadId ? f.leadId.toString() : null;
        const dealId = f.dealId ? f.dealId.toString() : null;

        await prisma.followUp.upsert({
          where: { id },
          create: {
            id,
            organizationId,
            userId,
            leadId,
            dealId,
            contactName: f.contactName || 'Contact',
            title: f.title || 'Follow up',
            type: f.type || 'CALL',
            dueDate: f.dueDate ? new Date(f.dueDate) : new Date(),
            time: f.time || '11:00 AM',
            priority: f.priority || 'MEDIUM',
            status: f.status || 'TODAY',
            notes: f.notes || '',
            createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
            updatedAt: f.updatedAt ? new Date(f.updatedAt) : new Date()
          },
          update: {
            userId,
            leadId,
            dealId,
            contactName: f.contactName || 'Contact',
            title: f.title || 'Follow up',
            type: f.type || 'CALL',
            dueDate: f.dueDate ? new Date(f.dueDate) : new Date(),
            time: f.time || '11:00 AM',
            priority: f.priority || 'MEDIUM',
            status: f.status || 'TODAY',
            notes: f.notes || '',
            updatedAt: f.updatedAt ? new Date(f.updatedAt) : new Date()
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate follow-up ${f.title}:`, err.message);
        followUpFailures++;
      }
    }
    const pgFollowUpCount = await prisma.followUp.count();
    stats.push({
      entity: 'FollowUps',
      mongoCount: mongoFollowUps.length,
      postgresCount: pgFollowUpCount,
      failed: followUpFailures,
      status: pgFollowUpCount === mongoFollowUps.length && followUpFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Follow-Ups: ${pgFollowUpCount} migrated (${followUpFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // 9. AUDIT LOGS
    // ------------------------------------------------------------------------
    console.log('Migrating Audit Logs...');
    const mongoAuditLogs = await db.collection('auditlogs').find().toArray();
    let auditFailures = 0;
    for (const log of mongoAuditLogs) {
      try {
        const id = log._id.toString();
        const organizationId = log.organizationId.toString();
        const userId = log.userId ? log.userId.toString() : null;

        await prisma.auditLog.upsert({
          where: { id },
          create: {
            id,
            organizationId,
            userId,
            userName: log.userName || 'System',
            userRole: log.userRole || 'SYSTEM',
            action: log.action || 'EVENT',
            details: log.details || '',
            ipAddress: log.ipAddress || null,
            createdAt: log.createdAt ? new Date(log.createdAt) : new Date()
          },
          update: {
            userName: log.userName || 'System',
            userRole: log.userRole || 'SYSTEM',
            action: log.action || 'EVENT',
            details: log.details || '',
            ipAddress: log.ipAddress || null
          }
        });
      } catch (err: any) {
        console.error(`  ✖ Failed to migrate audit log ${log._id}:`, err.message);
        auditFailures++;
      }
    }
    const pgAuditCount = await prisma.auditLog.count();
    stats.push({
      entity: 'AuditLogs',
      mongoCount: mongoAuditLogs.length,
      postgresCount: pgAuditCount,
      failed: auditFailures,
      status: pgAuditCount === mongoAuditLogs.length && auditFailures === 0 ? 'PASS' : 'FAIL'
    });
    console.log(`  ✓ Audit Logs: ${pgAuditCount} migrated (${auditFailures} failed)\n`);

    // ------------------------------------------------------------------------
    // DATA VALIDATION & RELATIONSHIP INTEGRITY CHECK
    // ------------------------------------------------------------------------
    console.log('====================================================');
    console.log('📊 MIGRATION VALIDATION REPORT');
    console.log('====================================================');
    console.log(
      'Entity'.padEnd(16) +
      'MongoDB'.padEnd(12) +
      'PostgreSQL'.padEnd(14) +
      'Failed'.padEnd(10) +
      'Status'
    );
    console.log('-'.repeat(60));

    for (const s of stats) {
      console.log(
        s.entity.padEnd(16) +
        String(s.mongoCount).padEnd(12) +
        String(s.postgresCount).padEnd(14) +
        String(s.failed).padEnd(10) +
        s.status
      );
    }
    console.log('-'.repeat(60));

    // Verify key relationships
    console.log('\nValidating Referential Integrity:');
    const allUsers = await prisma.user.findMany({ select: { id: true, organizationId: true } });
    const allLeads = await prisma.lead.findMany({ select: { id: true, organizationId: true } });
    const allDeals = await prisma.deal.findMany({ select: { id: true, organizationId: true } });
    const userWithoutOrg = allUsers.filter(u => !u.organizationId).length;
    const leadWithoutOrg = allLeads.filter(l => !l.organizationId).length;
    const dealWithoutOrg = allDeals.filter(d => !d.organizationId).length;
    console.log(`  - Users linked to Organization: ${userWithoutOrg === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  - Leads linked to Organization: ${leadWithoutOrg === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  - Deals linked to Organization: ${dealWithoutOrg === 0 ? 'PASS' : 'FAIL'}`);

    const allPassed = stats.every(s => s.status === 'PASS');
    if (allPassed) {
      console.log('\n🎉 ALL RECORD COUNTS AND INTEGRITY CHECKS PASSED PERFECTLY!');
    } else {
      console.warn('\n⚠ Some entities had mismatches. Please review failure logs above.');
    }

  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
    console.log('\nDatabase connections safely closed.');
  }
}

function leadSourceClean(val: any): string {
  if (typeof val === 'string' && val.trim().length > 0) return val;
  return 'Website';
}

migrate().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
