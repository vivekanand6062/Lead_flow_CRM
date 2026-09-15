const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { getLastDevEmail, clearDevEmails } = require('../services/emailService');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

describe('LeadFlow CRM — One-Time Real Organization & Single Admin Setup Suite', () => {
  let demoOrg = null;
  let demoAdmin = null;
  let realOrg = null;
  let realAdmin = null;
  let realAdminToken = '';

  const realOrgPayload = {
    companyName: 'Acme Apex Enterprises',
    adminName: 'Apex Primary Admin',
    adminEmail: 'apex.admin@acmeapex.com',
    password: 'PrimaryAdmin@2026',
    confirmPassword: 'PrimaryAdmin@2026'
  };

  before(async () => {
    // 1. Ensure Demo organization has isDemo = true
    await prisma.organization.updateMany({
      where: { name: 'LeadFlow Technologies' },
      data: { isDemo: true, setupCompleted: true }
    });

    demoOrg = await prisma.organization.findFirst({
      where: { isDemo: true }
    });
    assert.ok(demoOrg, 'Demo organization must exist');

    demoAdmin = await prisma.user.findFirst({
      where: { organizationId: demoOrg.id, role: 'ADMIN' }
    });
    assert.ok(demoAdmin, 'Demo Admin must exist in Demo organization');

    // 2. Clean up any previous test-created real organizations
    const testRealOrgs = await prisma.organization.findMany({
      where: { isDemo: false }
    });

    for (const org of testRealOrgs) {
      await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
      await prisma.followUp.deleteMany({ where: { organizationId: org.id } });
      await prisma.activity.deleteMany({ where: { organizationId: org.id } });
      await prisma.deal.deleteMany({ where: { organizationId: org.id } });
      await prisma.lead.deleteMany({ where: { organizationId: org.id } });
      await prisma.contact.deleteMany({ where: { organizationId: org.id } });
      await prisma.company.deleteMany({ where: { organizationId: org.id } });
      await prisma.passwordResetToken.deleteMany({ where: { user: { organizationId: org.id } } });
      await prisma.user.deleteMany({ where: { organizationId: org.id } });
      await prisma.organization.delete({ where: { id: org.id } });
    }
  });

  after(async () => {
    // Cleanup created real organization so test runs are idempotent
    if (realOrg) {
      await prisma.auditLog.deleteMany({ where: { organizationId: realOrg.id } });
      await prisma.followUp.deleteMany({ where: { organizationId: realOrg.id } });
      await prisma.activity.deleteMany({ where: { organizationId: realOrg.id } });
      await prisma.deal.deleteMany({ where: { organizationId: realOrg.id } });
      await prisma.lead.deleteMany({ where: { organizationId: org => org.id === realOrg.id } }).catch(() => {});
      await prisma.contact.deleteMany({ where: { organizationId: realOrg.id } });
      await prisma.company.deleteMany({ where: { organizationId: realOrg.id } });
      await prisma.passwordResetToken.deleteMany({ where: { user: { organizationId: realOrg.id } } });
      await prisma.user.deleteMany({ where: { organizationId: realOrg.id } });
      await prisma.organization.delete({ where: { id: realOrg.id } }).catch(() => {});
    }

    // Ensure Demo organization remains intact
    await prisma.organization.updateMany({
      where: { name: 'LeadFlow Technologies' },
      data: { isDemo: true, setupCompleted: true }
    });
  });

  // --------------------------------------------------------------------------
  // TEST 1: Fresh/uninitialized real environment with existing Demo data
  // --------------------------------------------------------------------------
  test('TEST 1: Fresh uninitialized real environment -> setupCompleted is false', async () => {
    const res = await fetch(`${BASE_URL}/setup/status`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(
      data.setupCompleted,
      false,
      'Demo organization must NOT cause setupCompleted to be true. Setup form must open.'
    );
    assert.equal(data.organizationName, null);
  });

  // --------------------------------------------------------------------------
  // TEST 2: Create Real Organization + Real Admin
  // --------------------------------------------------------------------------
  test('TEST 2: Create Real Organization + Real Admin -> 201 & auto-authentication JWT', async () => {
    const res = await fetch(`${BASE_URL}/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(realOrgPayload)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Must return JWT token for automatic authentication');
    assert.ok(data.user, 'Must return user object');
    assert.equal(data.user.role, 'ADMIN');
    assert.equal(data.user.email, realOrgPayload.adminEmail.toLowerCase());
    assert.equal(data.organization.name, realOrgPayload.companyName);

    realAdminToken = data.token;
    realAdmin = data.user;
    realOrg = data.organization;

    // Verify in database: exactly 1 Admin in real org, isDemo = false, setupCompleted = true
    const orgInDb = await prisma.organization.findUnique({
      where: { id: realOrg.id }
    });
    assert.equal(orgInDb.isDemo, false);
    assert.equal(orgInDb.setupCompleted, true);

    const adminsCount = await prisma.user.count({
      where: { organizationId: realOrg.id, role: 'ADMIN' }
    });
    assert.equal(adminsCount, 1, 'Real organization must have exactly 1 Admin');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Open /setup again -> Permanently LOCKED
  // --------------------------------------------------------------------------
  test('TEST 3: Open /setup again -> Setup is LOCKED permanently', async () => {
    // Check status
    const statusRes = await fetch(`${BASE_URL}/setup/status`);
    assert.equal(statusRes.status, 200);
    const statusData = await statusRes.json();
    assert.equal(statusData.setupCompleted, true, 'Status must report setupCompleted: true');
    assert.equal(statusData.organizationName, realOrgPayload.companyName);

    // Attempt second setup via POST
    const secondSetupRes = await fetch(`${BASE_URL}/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Intruder Corp',
        adminName: 'Intruder Admin',
        adminEmail: 'intruder@intruder.com',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      })
    });

    assert.equal(secondSetupRes.status, 400);
    const errData = await secondSetupRes.json();
    assert.equal(errData.success, false);
    assert.ok(errData.message.toLowerCase().includes('already completed') || errData.message.toLowerCase().includes('locked'));
  });

  // --------------------------------------------------------------------------
  // TEST 4: Try to create another Admin through API -> Rejected
  // --------------------------------------------------------------------------
  test('TEST 4: Try to create another Admin through API -> Rejected', async () => {
    // Attempt to pass role: 'ADMIN' to /api/users/managers
    const res = await fetch(`${BASE_URL}/users/managers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${realAdminToken}`
      },
      body: JSON.stringify({
        name: 'Second Admin Attempt',
        email: 'second.admin@acmeapex.com',
        password: 'Password@123',
        role: 'ADMIN'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes('administrator') || data.message.toLowerCase().includes('admin'));

    // Attempt direct database insert with role='ADMIN' in same org -> must violate unique index
    let dbError = null;
    try {
      await prisma.user.create({
        data: {
          organizationId: realOrg.id,
          name: 'Direct DB Second Admin',
          email: 'direct.admin@acmeapex.com',
          password: 'Password@123',
          role: 'ADMIN'
        }
      });
    } catch (err) {
      dbError = err;
    }
    assert.ok(dbError, 'PostgreSQL unique constraint must reject second Admin in same organization');
  });

  // --------------------------------------------------------------------------
  // TEST 5: Try to create another Admin through UI / endpoint -> ADMIN role blocked
  // --------------------------------------------------------------------------
  test('TEST 5: ADMIN role is blocked from normal user creation endpoints', async () => {
    const res = await fetch(`${BASE_URL}/users/sales-agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${realAdminToken}`
      },
      body: JSON.stringify({
        name: 'Agent With Admin Role Attempt',
        email: 'agent.admin.attempt@acmeapex.com',
        password: 'Password@123',
        role: 'ADMIN'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // --------------------------------------------------------------------------
  // TEST 6: Create Manager as Admin
  // --------------------------------------------------------------------------
  let createdManager = null;
  test('TEST 6: Create Manager as Real Admin -> Success', async () => {
    const res = await fetch(`${BASE_URL}/users/managers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${realAdminToken}`
      },
      body: JSON.stringify({
        name: 'Apex Sales Manager',
        email: 'manager.apex@acmeapex.com',
        password: 'ManagerPass@2026',
        department: 'Enterprise Sales',
        targetQuota: 5000000
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.name, 'Apex Sales Manager');
    createdManager = data.data;

    // Verify manager exists under realOrg
    const mgrInDb = await prisma.user.findUnique({
      where: { id: createdManager.id }
    });
    assert.equal(mgrInDb.role, 'MANAGER');
    assert.equal(mgrInDb.organizationId, realOrg.id);
  });

  // --------------------------------------------------------------------------
  // TEST 7: Create Sales Agent as Admin
  // --------------------------------------------------------------------------
  test('TEST 7: Create Sales Agent as Real Admin -> Success', async () => {
    const res = await fetch(`${BASE_URL}/users/sales-agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${realAdminToken}`
      },
      body: JSON.stringify({
        name: 'Apex Field Agent',
        email: 'agent.apex@acmeapex.com',
        password: 'AgentPass@2026',
        department: 'Direct Sales',
        targetQuota: 2000000,
        managerId: createdManager.id
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.name, 'Apex Field Agent');

    const agentInDb = await prisma.user.findUnique({
      where: { id: data.data.id }
    });
    assert.equal(agentInDb.role, 'SALES_AGENT');
    assert.equal(agentInDb.organizationId, realOrg.id);
  });

  // --------------------------------------------------------------------------
  // TEST 8: Login as Demo Admin -> Demo Organization only
  // --------------------------------------------------------------------------
  test('TEST 8: Login as Demo Admin -> Demo Organization data only', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@leadflow.com',
        password: 'Admin@123'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.email, 'admin@leadflow.com');
    assert.equal(data.user.organizationId, demoOrg.id);

    // Verify Demo Admin cannot see Real Org managers
    const managersRes = await fetch(`${BASE_URL}/users/managers`, {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    assert.equal(managersRes.status, 200);
    const managersData = await managersRes.json();
    const emails = managersData.data.map(m => m.email);
    assert.ok(!emails.includes('manager.apex@acmeapex.com'), 'Demo Admin must NOT see Real Org managers');
  });

  // --------------------------------------------------------------------------
  // TEST 9: Login as Real Admin -> Real Organization only
  // --------------------------------------------------------------------------
  test('TEST 9: Login as Real Admin -> Real Organization data only', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: realOrgPayload.adminEmail,
        password: realOrgPayload.password
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.email, realOrgPayload.adminEmail.toLowerCase());
    assert.equal(data.user.organizationId, realOrg.id);
    assert.notEqual(data.user.organizationId, demoOrg.id);

    // Real Admin must only see Real Org managers
    const managersRes = await fetch(`${BASE_URL}/users/managers`, {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    assert.equal(managersRes.status, 200);
    const managersData = await managersRes.json();
    const emails = managersData.data.map(m => m.email);
    assert.ok(emails.includes('manager.apex@acmeapex.com'), 'Real Admin must see their own manager');
    assert.ok(!emails.includes('rahul@leadflow.com'), 'Real Admin must NOT see Demo manager');
  });

  // --------------------------------------------------------------------------
  // TEST 10: Real Admin uses Forgot Password -> Same Admin reset, no second Admin
  // --------------------------------------------------------------------------
  let resetToken = '';
  test('TEST 10: Real Admin uses Forgot Password -> existing Admin updated, no second Admin', async () => {
    clearDevEmails();
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: realOrgPayload.adminEmail })
    });
    assert.equal(forgotRes.status, 200);

    const devEmail = getLastDevEmail();
    assert.ok(devEmail && devEmail.token);
    resetToken = devEmail.token;

    // Reset password to new password
    const newAdminPass = 'ApexAdminNewPass@2026';
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        newPassword: newAdminPass
      })
    });
    assert.equal(resetRes.status, 200);

    // Verify exactly ONE Admin remains in Real Org
    const adminsCount = await prisma.user.count({
      where: { organizationId: realOrg.id, role: 'ADMIN' }
    });
    assert.equal(adminsCount, 1, 'There must still be exactly 1 Admin in Real Org');

    const adminInDb = await prisma.user.findUnique({
      where: { email: realOrgPayload.adminEmail.toLowerCase() }
    });
    assert.equal(adminInDb.id, realAdmin.id, 'Same Admin ID must be preserved');
    assert.equal(adminInDb.organizationId, realOrg.id, 'Same Organization ID must be preserved');
    assert.equal(adminInDb.role, 'ADMIN', 'Role must remain ADMIN');
  });

  // --------------------------------------------------------------------------
  // TEST 11: Login with old password -> Rejected
  // --------------------------------------------------------------------------
  test('TEST 11: Login with old password -> Rejected (401)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: realOrgPayload.adminEmail,
        password: realOrgPayload.password // old password
      })
    });
    assert.equal(res.status, 401);
  });

  // --------------------------------------------------------------------------
  // TEST 12: Login with new password -> Successful
  // --------------------------------------------------------------------------
  test('TEST 12: Login with new password -> Successful (200)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: realOrgPayload.adminEmail,
        password: 'ApexAdminNewPass@2026' // new password
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.email, realOrgPayload.adminEmail.toLowerCase());
  });

  // --------------------------------------------------------------------------
  // TEST 13: Verify existing Demo accounts still work
  // --------------------------------------------------------------------------
  test('TEST 13: Existing Demo accounts (Admin, Manager, Agent) continue working', async () => {
    // Demo Admin
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@leadflow.com', password: 'Admin@123' })
    });
    assert.equal(adminRes.status, 200);

    // Demo Manager
    const managerRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@leadflow.com', password: 'Manager@123' })
    });
    assert.equal(managerRes.status, 200);

    // Demo Agent
    const agentRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'amit@leadflow.com', password: 'Agent@123' })
    });
    assert.equal(agentRes.status, 200);
  });
});
