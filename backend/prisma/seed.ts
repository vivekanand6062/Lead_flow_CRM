import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('[Prisma Seed] Clearing existing PostgreSQL tables...');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "audit_logs", "follow_ups", "activities", "deals", "leads", "contacts", "companies", "users", "organizations" CASCADE;`);

  console.log('[Prisma Seed] Creating Organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'LeadFlow Technologies',
      industry: 'Enterprise Software & SaaS',
      email: 'contact@leadflow.com',
      phone: '+91 98765 43210',
      website: 'https://leadflow.io',
      address: 'Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103',
      currency: 'INR',
      isDemo: true,
      setupCompleted: true
    }
  });

  console.log('[Prisma Seed] Creating Admin...');
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const agentPassword = await bcrypt.hash('Agent@123', 10);

  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Admin Demo',
      email: 'admin@leadflow.com',
      password: adminPassword,
      phone: '+91 98111 22334',
      role: 'ADMIN',
      department: 'Executive Leadership',
      status: 'ACTIVE'
    }
  });

  console.log('[Prisma Seed] Creating Managers...');
  const rahulManager = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Rahul Sharma',
      email: 'rahul@leadflow.com',
      password: managerPassword,
      phone: '+91 98222 33445',
      role: 'MANAGER',
      department: 'Enterprise Sales',
      targetQuota: new Prisma.Decimal(5000000),
      status: 'ACTIVE'
    }
  });

  const nehaManager = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Neha Kapoor',
      email: 'neha@leadflow.com',
      password: managerPassword,
      phone: '+91 98333 44556',
      role: 'MANAGER',
      department: 'Mid-Market Sales',
      targetQuota: new Prisma.Decimal(3500000),
      status: 'ACTIVE'
    }
  });

  console.log('[Prisma Seed] Creating Sales Agents...');
  const amitAgent = await prisma.user.create({
    data: {
      organizationId: org.id,
      managerId: rahulManager.id,
      name: 'Amit Verma',
      email: 'amit@leadflow.com',
      password: agentPassword,
      phone: '+91 98444 55667',
      role: 'SALES_AGENT',
      department: 'Enterprise AE',
      targetQuota: new Prisma.Decimal(2500000),
      status: 'ACTIVE'
    }
  });

  const priyaAgent = await prisma.user.create({
    data: {
      organizationId: org.id,
      managerId: rahulManager.id,
      name: 'Priya Mehta',
      email: 'priya@leadflow.com',
      password: agentPassword,
      phone: '+91 98555 66778',
      role: 'SALES_AGENT',
      department: 'Enterprise AE',
      targetQuota: new Prisma.Decimal(2500000),
      status: 'ACTIVE'
    }
  });

  const rohanAgent = await prisma.user.create({
    data: {
      organizationId: org.id,
      managerId: nehaManager.id,
      name: 'Rohan Gupta',
      email: 'rohan@leadflow.com',
      password: agentPassword,
      phone: '+91 98666 77889',
      role: 'SALES_AGENT',
      department: 'Mid-Market AE',
      targetQuota: new Prisma.Decimal(1800000),
      status: 'ACTIVE'
    }
  });

  const ananyaAgent = await prisma.user.create({
    data: {
      organizationId: org.id,
      managerId: nehaManager.id,
      name: 'Ananya Desai',
      email: 'ananya@leadflow.com',
      password: agentPassword,
      phone: '+91 98777 88990',
      role: 'SALES_AGENT',
      department: 'Inbound Growth Specialist',
      targetQuota: new Prisma.Decimal(1700000),
      status: 'ACTIVE'
    }
  });

  console.log('[Prisma Seed] Creating Companies...');
  const company1 = await prisma.company.create({
    data: {
      organizationId: org.id,
      name: 'XYZ Technologies',
      industry: 'Enterprise Cloud & DevOps',
      website: 'https://xyztech.example.com',
      phone: '+91 80 4123 4567',
      address: 'Indiranagar 100ft Road, Bengaluru',
      employeeCount: 250,
      annualRevenue: new Prisma.Decimal(45000000)
    }
  });

  const company2 = await prisma.company.create({
    data: {
      organizationId: org.id,
      name: 'Nova Systems',
      industry: 'FinTech & Payments',
      website: 'https://novasystems.example.com',
      phone: '+91 22 2654 9870',
      address: 'Bandra Kurra Complex, Mumbai',
      employeeCount: 180,
      annualRevenue: new Prisma.Decimal(32000000)
    }
  });

  console.log('[Prisma Seed] Creating Contacts...');
  const contact1 = await prisma.contact.create({
    data: {
      organizationId: org.id,
      companyId: company1.id,
      assignedAgentId: amitAgent.id,
      name: 'Rahul Verma',
      email: 'r.verma@xyztech.example.com',
      phone: '+91 99001 12233',
      designation: 'Chief Technology Officer',
      companyName: 'XYZ Technologies',
      notes: 'Primary decision maker for cloud infrastructure.'
    }
  });

  console.log('[Prisma Seed] Creating Leads...');
  const lead1 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      assignedAgentId: amitAgent.id,
      managerId: rahulManager.id,
      name: 'Arjun Nambiar',
      companyName: 'XYZ Technologies',
      email: 'arjun@xyztech.example.com',
      phone: '+91 98111 00001',
      status: 'NEGOTIATION',
      leadSource: 'Inbound Web',
      leadScore: 89,
      intentLevel: 'HIGH',
      scoreSignals: ['Visited pricing 5x', 'Downloaded security paper', 'Replied within 15 min'],
      scoreReasoning: 'Executive sponsor engaged, reviewing final master service agreement.',
      estimatedValue: new Prisma.Decimal(1500000),
      notes: 'Legal team reviewing standard indemnity clauses.'
    }
  });

  console.log('[Prisma Seed] Creating Deals...');
  const now = new Date();
  const closeNextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const deal1 = await prisma.deal.create({
    data: {
      organizationId: org.id,
      assignedAgentId: amitAgent.id,
      managerId: rahulManager.id,
      leadId: lead1.id,
      companyId: company1.id,
      contactId: contact1.id,
      title: 'XYZ Technologies — Enterprise CRM Deployment',
      companyName: 'XYZ Technologies',
      value: new Prisma.Decimal(1500000),
      currency: 'INR',
      probability: 75,
      stage: 'NEGOTIATION',
      status: 'OPEN',
      expectedCloseDate: closeNextWeek,
      riskHealth: 'GOOD',
      positiveSignals: ['CTO verbal approval secured', 'MSA in legal review'],
      riskSignals: ['Procurement SLA delay of 3 days'],
      recommendedAction: 'Coordinate with finance to verify standard payment terms.',
      notes: 'Key milestone for Q3 quota.'
    }
  });

  console.log('[Prisma Seed] Creating Activity & Follow-up...');
  await prisma.activity.create({
    data: {
      organizationId: org.id,
      userId: amitAgent.id,
      leadId: lead1.id,
      dealId: deal1.id,
      contactId: contact1.id,
      type: 'CALL',
      title: 'Call — Discussed SLA & Enterprise Indemnity',
      relatedCustomer: 'Arjun Nambiar (XYZ Technologies)',
      status: 'COMPLETED',
      notes: 'Agreed on 99.9% uptime SLA.'
    }
  });

  await prisma.followUp.create({
    data: {
      organizationId: org.id,
      userId: amitAgent.id,
      leadId: lead1.id,
      dealId: deal1.id,
      contactName: 'Rahul Sharma (XYZ)',
      title: 'Contract Negotiation Call',
      type: 'CALL',
      dueDate: now,
      time: '04:00 PM',
      priority: 'HIGH',
      status: 'TODAY',
      notes: 'Align on final signature date with executive team.'
    }
  });

  console.log('✓ PostgreSQL seed completed successfully!');
}

seed()
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
