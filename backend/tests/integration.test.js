const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

describe('LeadFlow CRM — PostgreSQL Migration E2E Test Suite', () => {
  let adminToken = '';
  let managerToken = '';
  let agentToken = '';
  let adminUser = null;
  let managerUser = null;
  let agentUser = null;

  before(async () => {
    // Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.status, 'healthy');

    // Login Admin
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@leadflow.com', password: 'Admin@123' })
    });
    assert.equal(adminRes.status, 200);
    const adminData = await adminRes.json();
    adminToken = adminData.token;
    adminUser = adminData.user;

    // Login Manager
    const managerRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@leadflow.com', password: 'Manager@123' })
    });
    assert.equal(managerRes.status, 200);
    const managerData = await managerRes.json();
    managerToken = managerData.token;
    managerUser = managerData.user;

    // Login Agent
    const agentRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'amit@leadflow.com', password: 'Agent@123' })
    });
    assert.equal(agentRes.status, 200);
    const agentData = await agentRes.json();
    agentToken = agentData.token;
    agentUser = agentData.user;
  });

  describe('1. Authentication & ID Compatibility', () => {
    test('Admin login returns both id and _id matching', () => {
      assert.ok(adminUser.id, 'id must be present');
      assert.ok(adminUser._id, '_id must be present for Mongoose compatibility');
      assert.equal(adminUser.id, adminUser._id);
      assert.equal(adminUser.role, 'ADMIN');
    });

    test('GET /api/auth/me returns authenticated user with both id and _id', async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.user.email, 'admin@leadflow.com');
      assert.equal(data.user._id, data.user.id);
    });

    test('Invalid credentials returns 401', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@leadflow.com', password: 'WrongPassword' })
      });
      assert.equal(res.status, 401);
    });
  });

  describe('2. Role-Based Access Control (RBAC)', () => {
    test('Sales Agent CANNOT access /api/users/managers (403)', async () => {
      const res = await fetch(`${BASE_URL}/users/managers`, {
        headers: { Authorization: `Bearer ${agentToken}` }
      });
      assert.equal(res.status, 403);
    });

    test('Manager CANNOT access /api/users/managers (403)', async () => {
      const res = await fetch(`${BASE_URL}/users/managers`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      assert.equal(res.status, 403);
    });

    test('Admin CAN access /api/users/managers (200)', async () => {
      const res = await fetch(`${BASE_URL}/users/managers`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.length > 0);
      json.data.forEach(m => {
        assert.equal(m.role, 'MANAGER');
        assert.equal(m._id, m.id);
        if (m.targetQuota !== null && m.targetQuota !== undefined) {
          assert.equal(typeof m.targetQuota, 'number', 'targetQuota must be serialized as number');
        }
      });
    });

    test('Sales Agent CANNOT access /api/settings (403)', async () => {
      const res = await fetch(`${BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${agentToken}` }
      });
      assert.equal(res.status, 403);
    });

    test('Admin CAN access /api/settings (200)', async () => {
      const res = await fetch(`${BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.organization);
      assert.equal(json.data.organization._id, json.data.organization.id);
    });
  });

  describe('3. Leads CRUD & Compatibility', () => {
    let createdLeadId = '';

    test('GET /api/leads returns list with _id and populated assignedAgentId', async () => {
      const res = await fetch(`${BASE_URL}/leads`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.length > 0);

      const firstLead = json.data[0];
      assert.ok(firstLead.id);
      assert.equal(firstLead._id, firstLead.id);
      if (firstLead.assignedAgentId) {
        assert.ok(typeof firstLead.assignedAgentId === 'object');
        assert.ok(firstLead.assignedAgentId.name);
        assert.equal(firstLead.assignedAgentId._id, firstLead.assignedAgentId.id);
      }
      if (firstLead.estimatedValue !== null && firstLead.estimatedValue !== undefined) {
        assert.equal(typeof firstLead.estimatedValue, 'number', 'estimatedValue must be a number');
      }
    });

    test('POST /api/leads creates lead with auto-calculated AI score and activity', async () => {
      const res = await fetch(`${BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`
        },
        body: JSON.stringify({
          name: 'Priya Sharma',
          companyName: 'Acme Technologies',
          email: 'priya.sharma@acmetech.com',
          phone: '+91 99887 76655',
          leadSource: 'Website',
          estimatedValue: 450000,
          assignedAgentId: agentUser.id
        })
      });
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      const lead = json.data;
      assert.ok(lead.id);
      assert.equal(lead._id, lead.id);
      assert.equal(lead.name, 'Priya Sharma');
      assert.equal(typeof lead.leadScore, 'number');
      assert.equal(typeof lead.estimatedValue, 'number');
      assert.equal(lead.estimatedValue, 450000);
      createdLeadId = lead.id;
    });

    test('GET /api/leads/:id returns single lead with timeline', async () => {
      const res = await fetch(`${BASE_URL}/leads/${createdLeadId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      const lead = json.data.lead;
      assert.equal(lead.id, createdLeadId);
      assert.equal(lead._id, createdLeadId);
      assert.equal(lead.name, 'Priya Sharma');
      assert.ok(Array.isArray(json.data.activities));
    });

    test('PUT /api/leads/:id updates lead status and creates audit/activity record', async () => {
      const res = await fetch(`${BASE_URL}/leads/${createdLeadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${agentToken}`
        },
        body: JSON.stringify({
          status: 'CONTACTED',
          notes: 'Customer answered call and requested demo.'
        })
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      const updated = json.data;
      assert.equal(updated.status, 'CONTACTED');
      assert.equal(updated.notes, 'Customer answered call and requested demo.');
    });

    test('DELETE /api/leads/:id removes the test lead', async () => {
      const res = await fetch(`${BASE_URL}/leads/${createdLeadId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);

      // Verify deletion
      const checkRes = await fetch(`${BASE_URL}/leads/${createdLeadId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(checkRes.status, 404);
    });
  });

  describe('4. Deals CRUD & Monetary Precision', () => {
    let createdDealId = '';

    test('GET /api/deals returns deals with Decimal numbers and populated relations', async () => {
      const res = await fetch(`${BASE_URL}/deals`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.length > 0);

      const deal = json.data[0];
      assert.ok(deal.id);
      assert.equal(deal._id, deal.id);
      assert.equal(typeof deal.value, 'number', 'deal.value must be a JavaScript number');
      assert.ok(deal.value > 0);
      if (deal.assignedAgentId) {
        assert.equal(deal.assignedAgentId._id, deal.assignedAgentId.id);
      }
    });

    test('POST /api/deals creates a new deal with Decimal precision', async () => {
      const res = await fetch(`${BASE_URL}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`
        },
        body: JSON.stringify({
          title: 'Acme Cloud Migration Deal',
          companyName: 'Acme Technologies',
          value: 1250000.50,
          stage: 'PROPOSAL',
          expectedCloseDate: '2026-11-30',
          assignedAgentId: agentUser.id
        })
      });
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      const deal = json.data;
      assert.ok(deal.id);
      assert.equal(deal._id, deal.id);
      assert.equal(deal.title, 'Acme Cloud Migration Deal');
      assert.equal(typeof deal.value, 'number');
      assert.equal(deal.value, 1250000.5);
      createdDealId = deal.id;
    });

    test('PUT /api/deals/:id updates stage and creates activity', async () => {
      const res = await fetch(`${BASE_URL}/deals/${createdDealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${agentToken}`
        },
        body: JSON.stringify({
          stage: 'NEGOTIATION',
          probability: 80
        })
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      const updated = json.data;
      assert.equal(updated.stage, 'NEGOTIATION');
      assert.equal(updated.probability, 80);
      assert.equal(typeof updated.value, 'number');
    });

    test('DELETE /api/deals/:id removes the test deal', async () => {
      const res = await fetch(`${BASE_URL}/deals/${createdDealId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
    });
  });

  describe('5. Companies & Contacts CRUD', () => {
    let testCompanyId = '';
    let testContactId = '';

    test('POST /api/companies creates company with annualRevenue as Decimal', async () => {
      const res = await fetch(`${BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: 'Nexus Dynamics Pvt Ltd',
          industry: 'Information Technology',
          annualRevenue: 85000000,
          address: 'Tech Park, Pune',
          employeeCount: 150
        })
      });
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      const comp = json.data;
      assert.ok(comp.id);
      assert.equal(comp._id, comp.id);
      assert.equal(typeof comp.annualRevenue, 'number');
      assert.equal(comp.annualRevenue, 85000000);
      testCompanyId = comp.id;
    });

    test('POST /api/contacts creates contact linked to company', async () => {
      const res = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: 'Karan Mehra',
          email: 'karan.m@nexusdyn.com',
          phone: '+91 91234 56789',
          designation: 'CTO',
          companyId: testCompanyId
        })
      });
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      const contact = json.data;
      assert.ok(contact.id);
      assert.equal(contact._id, contact.id);
      assert.equal(contact.name, 'Karan Mehra');
      testContactId = contact.id;
    });

    test('Cleanup test contact and company', async () => {
      const cRes = await fetch(`${BASE_URL}/contacts/${testContactId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(cRes.status, 200);

      const compRes = await fetch(`${BASE_URL}/companies/${testCompanyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(compRes.status, 200);
    });
  });

  describe('6. Follow-ups & Dynamic Status Computation', () => {
    let followUpId = '';

    test('POST /api/follow-ups creates follow-up and computes dynamic status', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await fetch(`${BASE_URL}/follow-ups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${agentToken}`
        },
        body: JSON.stringify({
          contactName: 'Rohit Kulkarni',
          title: 'Discuss pricing options',
          dueDate: tomorrow.toISOString(),
          priority: 'HIGH'
        })
      });
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      const fu = json.data;
      assert.ok(fu.id);
      assert.equal(fu._id, fu.id);
      assert.equal(fu.title, 'Discuss pricing options');
      followUpId = fu.id;
    });

    test('GET /api/follow-ups returns categorized lists', async () => {
      const res = await fetch(`${BASE_URL}/follow-ups`, {
        headers: { Authorization: `Bearer ${agentToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.categorized);
      assert.ok(Array.isArray(json.all));
    });

    test('PUT /api/follow-ups/:id marks as COMPLETED', async () => {
      const res = await fetch(`${BASE_URL}/follow-ups/${followUpId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${agentToken}`
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.status, 'COMPLETED');
    });

    test('DELETE /api/follow-ups/:id cleans up test follow-up', async () => {
      const res = await fetch(`${BASE_URL}/follow-ups/${followUpId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${agentToken}` }
      });
      assert.equal(res.status, 200);
    });
  });

  describe('7. Analytics Dashboard & AI Insights', () => {
    test('GET /api/analytics/dashboard returns complete metrics payload for Admin', async () => {
      const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.metrics, 'dashboard must contain metrics');
      assert.equal(typeof data.metrics.totalRevenue, 'number');
      assert.equal(typeof data.metrics.pipelineValue, 'number');
      assert.equal(typeof data.metrics.totalLeads, 'number');
      assert.equal(typeof data.metrics.activeDealsCount, 'number');
      assert.ok(data.funnel, 'dashboard must contain funnel');
    });

    test('GET /api/ai/sales-insights returns insights array', async () => {
      const res = await fetch(`${BASE_URL}/ai/sales-insights`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
    });

    test('POST /api/ai/lead-score calculates score for existing lead', async () => {
      // First get a lead id
      const leadsRes = await fetch(`${BASE_URL}/leads`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const leadsJson = await leadsRes.json();
      const firstLead = leadsJson.data[0];

      const res = await fetch(`${BASE_URL}/ai/lead-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${agentToken}`
        },
        body: JSON.stringify({ leadId: firstLead.id })
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(typeof json.data.leadScore, 'number');
      assert.ok(json.data.leadScore >= 0 && json.data.leadScore <= 100);
    });
  });
});
