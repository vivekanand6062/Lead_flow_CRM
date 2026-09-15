require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const Organization = require('../models/Organization');
const User = require('../models/User');
const Company = require('../models/Company');
const Contact = require('../models/Contact');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const AuditLog = require('../models/AuditLog');

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to MongoDB...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      Organization.deleteMany({}),
      User.deleteMany({}),
      Company.deleteMany({}),
      Contact.deleteMany({}),
      Lead.deleteMany({}),
      Deal.deleteMany({}),
      Activity.deleteMany({}),
      FollowUp.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // 1. Create Organization
    console.log('[Seed] Creating Organization...');
    const org = await Organization.create({
      name: 'LeadFlow Technologies',
      industry: 'Enterprise Software & SaaS',
      email: 'contact@leadflow.com',
      phone: '+91 98765 43210',
      website: 'https://leadflow.io',
      address: 'Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103',
      currency: 'INR',
      setupCompleted: true
    });

    // 2. Create Admin
    console.log('[Seed] Creating Admin...');
    const admin = await User.create({
      organizationId: org._id,
      name: 'Admin Demo',
      email: 'admin@leadflow.com',
      password: 'Admin@123',
      phone: '+91 98111 22334',
      role: 'ADMIN',
      department: 'Executive Leadership',
      status: 'ACTIVE'
    });

    // 3. Create Managers
    console.log('[Seed] Creating Managers...');
    const rahulManager = await User.create({
      organizationId: org._id,
      name: 'Rahul Sharma',
      email: 'rahul@leadflow.com',
      password: 'Manager@123',
      phone: '+91 98222 33445',
      role: 'MANAGER',
      department: 'Enterprise Sales',
      targetQuota: 5000000,
      status: 'ACTIVE'
    });

    const nehaManager = await User.create({
      organizationId: org._id,
      name: 'Neha Kapoor',
      email: 'neha@leadflow.com',
      password: 'Manager@123',
      phone: '+91 98333 44556',
      role: 'MANAGER',
      department: 'Mid-Market Sales',
      targetQuota: 3500000,
      status: 'ACTIVE'
    });

    // 4. Create Sales Agents
    console.log('[Seed] Creating Sales Agents...');
    // Under Rahul:
    const amitAgent = await User.create({
      organizationId: org._id,
      managerId: rahulManager._id,
      name: 'Amit Verma',
      email: 'amit@leadflow.com',
      password: 'Agent@123',
      phone: '+91 98444 55667',
      role: 'SALES_AGENT',
      department: 'Enterprise AE',
      targetQuota: 2500000,
      status: 'ACTIVE'
    });

    const priyaAgent = await User.create({
      organizationId: org._id,
      managerId: rahulManager._id,
      name: 'Priya Mehta',
      email: 'priya@leadflow.com',
      password: 'Agent@123',
      phone: '+91 98555 66778',
      role: 'SALES_AGENT',
      department: 'Enterprise AE',
      targetQuota: 2500000,
      status: 'ACTIVE'
    });

    // Under Neha:
    const rohanAgent = await User.create({
      organizationId: org._id,
      managerId: nehaManager._id,
      name: 'Rohan Gupta',
      email: 'rohan@leadflow.com',
      password: 'Agent@123',
      phone: '+91 98666 77889',
      role: 'SALES_AGENT',
      department: 'Mid-Market AE',
      targetQuota: 1800000,
      status: 'ACTIVE'
    });

    const ananyaAgent = await User.create({
      organizationId: org._id,
      managerId: nehaManager._id,
      name: 'Ananya Desai',
      email: 'ananya@leadflow.com',
      password: 'Agent@123',
      phone: '+91 98777 88990',
      role: 'SALES_AGENT',
      department: 'Inbound Growth Specialist',
      targetQuota: 1700000,
      status: 'ACTIVE'
    });

    // 5. Create Companies
    console.log('[Seed] Creating Companies...');
    const companies = await Company.insertMany([
      {
        organizationId: org._id,
        name: 'XYZ Technologies',
        industry: 'Enterprise Cloud & DevOps',
        website: 'https://xyztech.example.com',
        phone: '+91 80 4123 4567',
        address: 'Indiranagar 100ft Road, Bengaluru',
        employeeCount: 250,
        annualRevenue: 45000000
      },
      {
        organizationId: org._id,
        name: 'Nova Systems',
        industry: 'FinTech & Payments',
        website: 'https://novasystems.example.com',
        phone: '+91 22 2654 9870',
        address: 'Bandra Kurla Complex, Mumbai',
        employeeCount: 180,
        annualRevenue: 32000000
      },
      {
        organizationId: org._id,
        name: 'Acme Digital',
        industry: 'Retail & E-commerce',
        website: 'https://acmedigital.example.com',
        phone: '+91 11 4987 1234',
        address: 'Connaught Place, New Delhi',
        employeeCount: 500,
        annualRevenue: 85000000
      },
      {
        organizationId: org._id,
        name: 'Apex Cloudworks',
        industry: 'SaaS Infrastructure',
        website: 'https://apexcloud.example.com',
        phone: '+91 40 6789 0123',
        address: 'Hitec City, Hyderabad',
        employeeCount: 95,
        annualRevenue: 18000000
      },
      {
        organizationId: org._id,
        name: 'FinEdge Solutions',
        industry: 'Banking Security',
        website: 'https://finedge.example.com',
        phone: '+91 80 2345 6789',
        address: 'Whitefield, Bengaluru',
        employeeCount: 320,
        annualRevenue: 60000000
      },
      {
        organizationId: org._id,
        name: 'CloudMatrix Global',
        industry: 'HealthTech & Analytics',
        website: 'https://cloudmatrix.example.com',
        phone: '+91 20 6655 4433',
        address: 'Kalyani Nagar, Pune',
        employeeCount: 140,
        annualRevenue: 24000000
      }
    ]);

    // 6. Create Contacts
    console.log('[Seed] Creating Contacts...');
    const contacts = await Contact.insertMany([
      {
        organizationId: org._id,
        companyId: companies[0]._id,
        assignedAgentId: amitAgent._id,
        name: 'Rahul Verma',
        email: 'r.verma@xyztech.example.com',
        phone: '+91 99001 12233',
        designation: 'Chief Technology Officer',
        companyName: 'XYZ Technologies',
        notes: 'Primary decision maker for cloud infrastructure.'
      },
      {
        organizationId: org._id,
        companyId: companies[1]._id,
        assignedAgentId: priyaAgent._id,
        name: 'Sneha Iyer',
        email: 'sneha.iyer@novasystems.example.com',
        phone: '+91 99002 23344',
        designation: 'VP of Revenue Operations',
        companyName: 'Nova Systems',
        notes: 'Champion for automating sales reporting.'
      },
      {
        organizationId: org._id,
        companyId: companies[2]._id,
        assignedAgentId: amitAgent._id,
        name: 'Vikram Malhotra',
        email: 'v.malhotra@acmedigital.example.com',
        phone: '+91 99003 34455',
        designation: 'Head of Growth',
        companyName: 'Acme Digital',
        notes: 'Signed 12-month enterprise agreement.'
      },
      {
        organizationId: org._id,
        companyId: companies[3]._id,
        assignedAgentId: rohanAgent._id,
        name: 'Deepa Nair',
        email: 'deepa@apexcloud.example.com',
        phone: '+91 99004 45566',
        designation: 'Director of Engineering',
        companyName: 'Apex Cloudworks',
        notes: 'Requested technical architecture review.'
      },
      {
        organizationId: org._id,
        companyId: companies[4]._id,
        assignedAgentId: priyaAgent._id,
        name: 'Karthik Menon',
        email: 'karthik@finedge.example.com',
        phone: '+91 99005 56677',
        designation: 'Chief Information Security Officer',
        companyName: 'FinEdge Solutions',
        notes: 'Reviewing security and SOC2 compliance.'
      },
      {
        organizationId: org._id,
        companyId: companies[5]._id,
        assignedAgentId: ananyaAgent._id,
        name: 'Dr. Sunita Rao',
        email: 'sunita.rao@cloudmatrix.example.com',
        phone: '+91 99006 67788',
        designation: 'Managing Director',
        companyName: 'CloudMatrix Global',
        notes: 'Onboarded on annual growth plan.'
      }
    ]);

    // 7. Create Leads across 7 stages
    console.log('[Seed] Creating Leads...');
    const leads = await Lead.insertMany([
      {
        organizationId: org._id,
        assignedAgentId: amitAgent._id,
        managerId: rahulManager._id,
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
        estimatedValue: 1500000,
        notes: 'Legal team reviewing standard indemnity clauses.'
      },
      {
        organizationId: org._id,
        assignedAgentId: priyaAgent._id,
        managerId: rahulManager._id,
        name: 'Kavita Chawla',
        companyName: 'Nova Systems',
        email: 'kavita@novasystems.example.com',
        phone: '+91 98111 00002',
        status: 'PROPOSAL',
        leadSource: 'Partner Referral',
        leadScore: 78,
        intentLevel: 'HIGH',
        scoreSignals: ['Requested custom ROI breakdown', 'Active email response'],
        scoreReasoning: 'Evaluating LeadFlow against legacy spreadsheet workflow.',
        estimatedValue: 850000,
        notes: 'Sent revised scope of work on 12 Sep.'
      },
      {
        organizationId: org._id,
        assignedAgentId: amitAgent._id,
        managerId: rahulManager._id,
        name: 'Rajesh Kulkarni',
        companyName: 'Acme Digital',
        email: 'rajesh@acmedigital.example.com',
        phone: '+91 98111 00003',
        status: 'WON',
        leadSource: 'Direct Sales',
        leadScore: 95,
        intentLevel: 'HIGH',
        scoreSignals: ['Contract executed', 'PO issued'],
        scoreReasoning: 'Successfully converted enterprise client.',
        estimatedValue: 1200000,
        notes: 'Deal closed. Handed over to Customer Success.'
      },
      {
        organizationId: org._id,
        assignedAgentId: rohanAgent._id,
        managerId: nehaManager._id,
        name: 'Manish Pandey',
        companyName: 'Apex Cloudworks',
        email: 'manish@apexcloud.example.com',
        phone: '+91 98111 00004',
        status: 'QUALIFIED',
        leadSource: 'Webinar',
        leadScore: 68,
        intentLevel: 'MEDIUM',
        scoreSignals: ['Attended live product session', 'Requested demo'],
        scoreReasoning: 'Budget verified. Demo scheduled for Friday.',
        estimatedValue: 420000,
        notes: 'Looking to replace Hubspot with a leaner team tool.'
      },
      {
        organizationId: org._id,
        assignedAgentId: priyaAgent._id,
        managerId: rahulManager._id,
        name: 'Pooja Hegde',
        companyName: 'FinEdge Solutions',
        email: 'pooja.h@finedge.example.com',
        phone: '+91 98111 00005',
        status: 'NEGOTIATION',
        leadSource: 'LinkedIn Campaign',
        leadScore: 91,
        intentLevel: 'HIGH',
        scoreSignals: ['Enterprise security checklist cleared', 'Procurement involved'],
        scoreReasoning: 'High intent enterprise deal in procurement final review.',
        estimatedValue: 1800000,
        notes: 'Procurement meeting set for Wednesday.'
      },
      {
        organizationId: org._id,
        assignedAgentId: ananyaAgent._id,
        managerId: nehaManager._id,
        name: 'Tanvi Joshi',
        companyName: 'CloudMatrix Global',
        email: 'tanvi@cloudmatrix.example.com',
        phone: '+91 98111 00006',
        status: 'WON',
        leadSource: 'Cold Outreach',
        leadScore: 92,
        intentLevel: 'HIGH',
        scoreSignals: ['Annual billing pre-paid', 'Rapid onboarding'],
        scoreReasoning: 'Deal closed with 1-year prepaid subscription.',
        estimatedValue: 600000,
        notes: 'Live on production tier.'
      },
      {
        organizationId: org._id,
        assignedAgentId: amitAgent._id,
        managerId: rahulManager._id,
        name: 'Sameer Sen',
        companyName: 'Zenith Logistics',
        email: 'sameer@zenithlogistics.example.com',
        phone: '+91 98111 00007',
        status: 'CONTACTED',
        leadSource: 'Inbound Web',
        leadScore: 54,
        intentLevel: 'MEDIUM',
        scoreSignals: ['Form submitted', 'First discovery call held'],
        scoreReasoning: 'Identified pain points in regional dispatch tracking.',
        estimatedValue: 750000,
        notes: 'Awaiting stakeholder availability for next week.'
      },
      {
        organizationId: org._id,
        assignedAgentId: rohanAgent._id,
        managerId: nehaManager._id,
        name: 'Suresh Raina',
        companyName: 'Starlight Retail',
        email: 'suresh@starlightretail.example.com',
        phone: '+91 98111 00008',
        status: 'NEW',
        leadSource: 'Website',
        leadScore: 42,
        intentLevel: 'LOW',
        scoreSignals: ['Contact form submitted today'],
        scoreReasoning: 'New lead requiring initial phone qualification.',
        estimatedValue: 350000,
        notes: 'Submitted demo inquiry 2 hours ago.'
      },
      {
        organizationId: org._id,
        assignedAgentId: ananyaAgent._id,
        managerId: nehaManager._id,
        name: 'Kunal Shah',
        companyName: 'Horizon Financial',
        email: 'kunal@horizonfin.example.com',
        phone: '+91 98111 00009',
        status: 'LOST',
        leadSource: 'Organic Search',
        leadScore: 35,
        intentLevel: 'LOW',
        scoreSignals: ['Budget frozen for current quarter'],
        scoreReasoning: 'Client decided to defer CRM transition to next fiscal year.',
        estimatedValue: 500000,
        notes: 'Lost to status quo. Re-engage in Q1 next year.'
      }
    ]);

    // 8. Create Deals across pipeline stages
    console.log('[Seed] Creating Pipeline Deals...');
    const now = new Date();
    const closeNextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const closeNextMonth = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
    const pastClosed = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const deals = await Deal.insertMany([
      {
        organizationId: org._id,
        assignedAgentId: amitAgent._id,
        managerId: rahulManager._id,
        leadId: leads[0]._id,
        companyId: companies[0]._id,
        contactId: contacts[0]._id,
        title: 'XYZ Technologies — Enterprise CRM Deployment',
        companyName: 'XYZ Technologies',
        value: 1500000,
        probability: 75,
        stage: 'NEGOTIATION',
        status: 'OPEN',
        expectedCloseDate: closeNextWeek,
        riskHealth: 'GOOD',
        positiveSignals: ['CTO verbal approval secured', 'MSA in legal review'],
        riskSignals: ['Procurement SLA delay of 3 days'],
        recommendedAction: 'Coordinate with finance to verify standard payment terms.',
        notes: 'Key milestone for Q3 quota.'
      },
      {
        organizationId: org._id,
        assignedAgentId: priyaAgent._id,
        managerId: rahulManager._id,
        leadId: leads[1]._id,
        companyId: companies[1]._id,
        contactId: contacts[1]._id,
        title: 'Nova Systems — Sales Automation Engine',
        companyName: 'Nova Systems',
        value: 850000,
        probability: 60,
        stage: 'PROPOSAL',
        status: 'OPEN',
        expectedCloseDate: closeNextMonth,
        riskHealth: 'MODERATE',
        positiveSignals: ['Demonstrated positive ROI in sandbox demo'],
        riskSignals: ['No follow-up logged in last 6 days'],
        recommendedAction: 'Send updated case study and request feedback on pricing proposal.',
        notes: 'Competitor mentioned in early conversations.'
      },
      {
        organizationId: org._id,
        assignedAgentId: amitAgent._id,
        managerId: rahulManager._id,
        leadId: leads[2]._id,
        companyId: companies[2]._id,
        contactId: contacts[2]._id,
        title: 'Acme Digital — Multi-Brand CRM Solution',
        companyName: 'Acme Digital',
        value: 1200000,
        probability: 100,
        stage: 'WON',
        status: 'WON',
        expectedCloseDate: pastClosed,
        riskHealth: 'GOOD',
        positiveSignals: ['Paid annual subscription', 'Signed enterprise MSA'],
        riskSignals: [],
        recommendedAction: 'Hand off to Customer Success team for deployment.',
        notes: 'Closed on 4 Sep.'
      },
      {
        organizationId: org._id,
        assignedAgentId: rohanAgent._id,
        managerId: nehaManager._id,
        leadId: leads[3]._id,
        companyId: companies[3]._id,
        contactId: contacts[3]._id,
        title: 'Apex Cloudworks — Pipeline & Quota Tracker',
        companyName: 'Apex Cloudworks',
        value: 420000,
        probability: 50,
        stage: 'QUALIFIED',
        status: 'OPEN',
        expectedCloseDate: closeNextMonth,
        riskHealth: 'GOOD',
        positiveSignals: ['Technical team validation complete'],
        riskSignals: ['Awaiting executive sign-off'],
        recommendedAction: 'Prepare formal executive summary presentation.',
        notes: 'Demo went very well.'
      },
      {
        organizationId: org._id,
        assignedAgentId: priyaAgent._id,
        managerId: rahulManager._id,
        leadId: leads[4]._id,
        companyId: companies[4]._id,
        contactId: contacts[4]._id,
        title: 'FinEdge Solutions — Security & SOC2 CRM Expansion',
        companyName: 'FinEdge Solutions',
        value: 1800000,
        probability: 80,
        stage: 'NEGOTIATION',
        status: 'OPEN',
        expectedCloseDate: closeNextWeek,
        riskHealth: 'GOOD',
        positiveSignals: ['SOC2 compliance questionnaire approved', 'High executive priority'],
        riskSignals: [],
        recommendedAction: 'Send final digital signing link via DocuSign.',
        notes: 'Highest value pipeline deal this quarter.'
      },
      {
        organizationId: org._id,
        assignedAgentId: ananyaAgent._id,
        managerId: nehaManager._id,
        leadId: leads[5]._id,
        companyId: companies[5]._id,
        contactId: contacts[5]._id,
        title: 'CloudMatrix Global — Growth Tier 1-Year',
        companyName: 'CloudMatrix Global',
        value: 600000,
        probability: 100,
        stage: 'WON',
        status: 'WON',
        expectedCloseDate: pastClosed,
        riskHealth: 'GOOD',
        positiveSignals: ['Full upfront payment received'],
        riskSignals: [],
        recommendedAction: 'Schedule 30-day executive review call.',
        notes: 'Successfully closed.'
      },
      {
        organizationId: org._id,
        assignedAgentId: ananyaAgent._id,
        managerId: nehaManager._id,
        leadId: leads[8]._id,
        companyId: null,
        contactId: null,
        title: 'Horizon Financial — Enterprise Pilot',
        companyName: 'Horizon Financial',
        value: 500000,
        probability: 0,
        stage: 'LOST',
        status: 'LOST',
        expectedCloseDate: pastClosed,
        riskHealth: 'AT_RISK',
        positiveSignals: [],
        riskSignals: ['Budget reallocation away from sales tools'],
        recommendedAction: 'Add to quarterly nurture campaign for re-engagement.',
        notes: 'Lost due to budget freeze.'
      }
    ]);

    // 9. Create Activities
    console.log('[Seed] Creating Activities...');
    await Activity.insertMany([
      {
        organizationId: org._id,
        userId: amitAgent._id,
        leadId: leads[0]._id,
        dealId: deals[0]._id,
        contactId: contacts[0]._id,
        type: 'CALL',
        title: 'Call — Discussed SLA & Enterprise Indemnity',
        relatedCustomer: 'Arjun Nambiar (XYZ Technologies)',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        notes: 'Spoke with Arjun and VP of Tech. Agreed on 99.9% uptime SLA.'
      },
      {
        organizationId: org._id,
        userId: amitAgent._id,
        leadId: leads[0]._id,
        dealId: deals[0]._id,
        type: 'MEETING',
        title: 'Product Demonstration Completed',
        relatedCustomer: 'XYZ Technologies',
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        notes: 'Demonstrated pipeline management, AI deal risk alerts, and role hierarchies.'
      },
      {
        organizationId: org._id,
        userId: priyaAgent._id,
        leadId: leads[1]._id,
        dealId: deals[1]._id,
        contactId: contacts[1]._id,
        type: 'EMAIL',
        title: 'Email — Sent Custom Proposal & Pricing Schedule',
        relatedCustomer: 'Sneha Iyer (Nova Systems)',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        notes: 'Sent formal 3-tier quotation with 15% annual prepayment discount.'
      },
      {
        organizationId: org._id,
        userId: rohanAgent._id,
        leadId: leads[3]._id,
        dealId: deals[3]._id,
        type: 'MEETING',
        title: 'Discovery Meeting with Tech Team',
        relatedCustomer: 'Apex Cloudworks',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        notes: 'Reviewed current pain points with spreadsheet data silos.'
      }
    ]);

    // 10. Create Follow-ups (Categorized)
    console.log('[Seed] Creating Follow-ups...');
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    await FollowUp.insertMany([
      // Overdue
      {
        organizationId: org._id,
        userId: priyaAgent._id,
        leadId: leads[1]._id,
        dealId: deals[1]._id,
        contactName: 'Sneha Iyer',
        title: 'Follow up on Proposal Review',
        type: 'EMAIL',
        dueDate: yesterday,
        time: '02:30 PM',
        priority: 'HIGH',
        status: 'OVERDUE',
        notes: 'Needs urgent check-in as proposal was delivered 3 days ago.'
      },
      // Today
      {
        organizationId: org._id,
        userId: amitAgent._id,
        leadId: leads[0]._id,
        dealId: deals[0]._id,
        contactName: 'Rahul Sharma (XYZ)',
        title: 'Contract Negotiation Call',
        type: 'CALL',
        dueDate: now,
        time: '04:00 PM',
        priority: 'HIGH',
        status: 'TODAY',
        notes: 'Align on final signature date with executive team.'
      },
      {
        organizationId: org._id,
        userId: rohanAgent._id,
        leadId: leads[3]._id,
        dealId: deals[3]._id,
        contactName: 'Deepa Nair',
        title: 'Send Architecture Deck',
        type: 'TASK',
        dueDate: now,
        time: '05:30 PM',
        priority: 'MEDIUM',
        status: 'TODAY',
        notes: 'Share infrastructure security specifications.'
      },
      // Upcoming
      {
        organizationId: org._id,
        userId: priyaAgent._id,
        leadId: leads[4]._id,
        dealId: deals[4]._id,
        contactName: 'Karthik Menon',
        title: 'Procurement Alignment Sync',
        type: 'MEETING',
        dueDate: tomorrow,
        time: '11:00 AM',
        priority: 'HIGH',
        status: 'UPCOMING',
        notes: 'Confirm vendor bank details and purchase order issuance.'
      },
      {
        organizationId: org._id,
        userId: ananyaAgent._id,
        leadId: leads[7]._id,
        contactName: 'Suresh Raina',
        title: 'Introductory Discovery Call',
        type: 'CALL',
        dueDate: nextWeek,
        time: '03:00 PM',
        priority: 'MEDIUM',
        status: 'UPCOMING',
        notes: 'Qualify team size and pipeline volume.'
      },
      // Completed
      {
        organizationId: org._id,
        userId: amitAgent._id,
        leadId: leads[2]._id,
        dealId: deals[2]._id,
        contactName: 'Vikram Malhotra',
        title: 'Welcome Call & Credentials Handover',
        type: 'CALL',
        dueDate: pastClosed,
        time: '10:00 AM',
        priority: 'HIGH',
        status: 'COMPLETED',
        notes: 'Customer successfully logged into LeadFlow CRM.'
      }
    ]);

    console.log('[Seed] Database successfully seeded with realistic B2B data!');
    console.log('--------------------------------------------------');
    console.log('DEMO ACCOUNTS FOR INTERVIEW / EVALUATION:');
    console.log('Admin Demo:        admin@leadflow.com  /  Admin@123');
    console.log('Manager Demo 1:    rahul@leadflow.com  /  Manager@123  (Team: Amit, Priya)');
    console.log('Manager Demo 2:    neha@leadflow.com   /  Manager@123  (Team: Rohan, Ananya)');
    console.log('Sales Agent Demo:  amit@leadflow.com   /  Agent@123');
    console.log('Sales Agent Demo:  priya@leadflow.com  /  Agent@123');
    console.log('--------------------------------------------------');

    return {
      success: true,
      message: 'Database successfully seeded with realistic B2B data'
    };
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };
