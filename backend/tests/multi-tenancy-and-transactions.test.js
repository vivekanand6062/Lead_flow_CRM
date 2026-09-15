const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

describe('Multi-Tenancy Isolation & Transaction Atomicity Suite', () => {
  let org1AdminToken = '';
  let org2AdminToken = '';
  let org2 = null;
  let org2User = null;
  let org2Lead = null;
  let org2Deal = null;

  before(async () => {
    // 1. Get Org 1 Admin Token
    const res1 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@leadflow.com', password: 'Admin@123' })
    });
    const data1 = await res1.json();
    org1AdminToken = data1.token;

    // 2. Create isolated Org 2 in PostgreSQL
    org2 = await prisma.organization.create({
      data: {
        name: 'Isolated Tenant Corp',
        industry: 'Healthcare Tech',
        email: 'admin@isolatedcorp.com',
        setupCompleted: true
      }
    });

    const hashedPassword = await bcrypt.hash('Tenant2Pass@123', 10);
    org2User = await prisma.user.create({
      data: {
        organizationId: org2.id,
        name: 'Tenant 2 Admin',
        email: 'admin@isolatedcorp.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    org2AdminToken = jwt.sign(
      { id: org2User.id, role: org2User.role },
      process.env.JWT_SECRET || 'leadflow_test_jwt_secret_mock',
      { expiresIn: '1d' }
    );

    // Create a Lead and Deal in Org 2
    org2Lead = await prisma.lead.create({
      data: {
        organizationId: org2.id,
        name: 'Tenant 2 Confidential Lead',
        companyName: 'Private Health Inc',
        email: 'confidential@privatehealth.com',
        status: 'NEW',
        leadScore: 88,
        estimatedValue: 750000
      }
    });

    org2Deal = await prisma.deal.create({
      data: {
        organizationId: org2.id,
        title: 'Tenant 2 Confidential Deal',
        companyName: 'Private Health Inc',
        value: 1500000,
        stage: 'PROPOSAL',
        expectedCloseDate: new Date('2026-12-31')
      }
    });
  });

  after(async () => {
    // Cleanup isolated Org 2 and its children
    if (org2) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "organizations" WHERE id = '${org2.id}';`
      );
    }
    await prisma.$disconnect();
  });

  describe('1. Multi-Tenant Data Isolation', () => {
    test('Org 1 user CANNOT see Org 2 leads in GET /api/leads', async () => {
      const res = await fetch(`${BASE_URL}/leads`, {
        headers: { Authorization: `Bearer ${org1AdminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      const leaked = json.data.find(l => l.id === org2Lead.id || l.name === 'Tenant 2 Confidential Lead');
      assert.equal(leaked, undefined, 'Org 2 lead must NEVER appear in Org 1 query results');
    });

    test('Org 1 user CANNOT see Org 2 deals in GET /api/deals', async () => {
      const res = await fetch(`${BASE_URL}/deals`, {
        headers: { Authorization: `Bearer ${org1AdminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      const leaked = json.data.find(d => d.id === org2Deal.id || d.title === 'Tenant 2 Confidential Deal');
      assert.equal(leaked, undefined, 'Org 2 deal must NEVER appear in Org 1 query results');
    });

    test('Org 1 user gets 404 when querying Org 2 lead directly by ID', async () => {
      const res = await fetch(`${BASE_URL}/leads/${org2Lead.id}`, {
        headers: { Authorization: `Bearer ${org1AdminToken}` }
      });
      assert.equal(res.status, 404, 'Direct access across tenant boundary must return 404 Not Found');
    });

    test('Org 1 user gets 404 when querying Org 2 deal directly by ID', async () => {
      const res = await fetch(`${BASE_URL}/deals/${org2Deal.id}`, {
        headers: { Authorization: `Bearer ${org1AdminToken}` }
      });
      assert.equal(res.status, 404, 'Direct access across tenant boundary must return 404 Not Found');
    });

    test('Org 2 user CAN access their own lead by ID', async () => {
      const res = await fetch(`${BASE_URL}/leads/${org2Lead.id}`, {
        headers: { Authorization: `Bearer ${org2AdminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.lead.name, 'Tenant 2 Confidential Lead');
    });
  });

  describe('2. Referential Integrity & Deletion Rules', () => {
    test('Deleting an agent sets assignedAgentId to NULL on Leads (SetNull rule)', async () => {
      // Create a temporary agent in Org 2
      const tempAgent = await prisma.user.create({
        data: {
          organizationId: org2.id,
          name: 'Temporary Agent',
          email: 'temp.agent@isolatedcorp.com',
          password: 'temp',
          role: 'SALES_AGENT'
        }
      });

      // Create a lead assigned to this agent
      const lead = await prisma.lead.create({
        data: {
          organizationId: org2.id,
          assignedAgentId: tempAgent.id,
          name: 'Agent Test Lead',
          companyName: 'Test Co'
        }
      });

      assert.equal(lead.assignedAgentId, tempAgent.id);

      // Delete the agent
      await prisma.user.delete({ where: { id: tempAgent.id } });

      // Verify lead still exists, with assignedAgentId set to null
      const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id } });
      assert.ok(updatedLead, 'Lead must not be deleted when agent is removed');
      assert.equal(updatedLead.assignedAgentId, null, 'assignedAgentId must be set to null');

      // Cleanup lead
      await prisma.lead.delete({ where: { id: lead.id } });
    });

    test('Deleting a lead Cascades to its activities (Cascade rule)', async () => {
      const lead = await prisma.lead.create({
        data: {
          organizationId: org2.id,
          name: 'Cascade Test Lead',
          companyName: 'Cascade Co'
        }
      });

      const act = await prisma.activity.create({
        data: {
          organizationId: org2.id,
          userId: org2User.id,
          leadId: lead.id,
          type: 'CALL',
          title: 'Initial contact call',
          relatedCustomer: 'Cascade Test'
        }
      });

      assert.ok(act.id);

      // Delete the lead
      await prisma.lead.delete({ where: { id: lead.id } });

      // Verify activity was cascaded
      const checkAct = await prisma.activity.findUnique({ where: { id: act.id } });
      assert.equal(checkAct, null, 'Activity must be cascaded on lead deletion');
    });
  });
});
