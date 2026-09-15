const bcrypt = require('bcryptjs');
const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const { serialize, serializeEntity } = require('../utils/serializer');

/**
 * ADMIN ONLY: Manage Managers
 */
const getManagers = async (req, res, next) => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        organizationId: req.organizationId,
        role: 'MANAGER'
      },
      include: {
        directReports: {
          where: { role: 'SALES_AGENT' },
          select: { id: true }
        },
        managedDeals: {
          where: { stage: 'WON' },
          select: { value: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const managersWithStats = managers.map((m) => {
      const agentCount = m.directReports.length;
      const teamRevenue = m.managedDeals.reduce((sum, d) => sum + Number(d.value), 0);
      const serialized = serializeEntity(m);
      delete serialized.password;
      delete serialized.directReports;
      delete serialized.managedDeals;

      return {
        ...serialized,
        agentCount,
        teamRevenue
      };
    });

    res.json({
      success: true,
      data: managersWithStats
    });
  } catch (error) {
    next(error);
  }
};

const getManagerById = async (req, res, next) => {
  try {
    const manager = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
        role: 'MANAGER'
      }
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    const agents = await prisma.user.findMany({
      where: {
        managerId: manager.id,
        role: 'SALES_AGENT'
      },
      orderBy: { createdAt: 'desc' }
    });

    const deals = await prisma.deal.findMany({
      where: { managerId: manager.id }
    });
    const wonRevenue = deals.filter(d => d.stage === 'WON').reduce((sum, d) => sum + Number(d.value), 0);

    const serializedManager = serializeEntity(manager);
    delete serializedManager.password;

    const serializedAgents = agents.map(a => {
      const ser = serializeEntity(a);
      delete ser.password;
      return ser;
    });

    res.json({
      success: true,
      data: {
        manager: serializedManager,
        agents: serializedAgents,
        stats: {
          agentCount: agents.length,
          wonRevenue,
          dealsCount: deals.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const createManager = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, targetQuota } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || null;

    if (req.body.role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Creating additional Administrator accounts is forbidden. An organization may only have exactly one Admin.'
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [manager] = await prisma.$transaction([
      prisma.user.create({
        data: {
          organizationId: req.organizationId,
          name,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          phone: phone || null,
          department: department || 'Sales Management',
          targetQuota: new Prisma.Decimal(targetQuota || 5000000),
          role: 'MANAGER',
          status: 'ACTIVE'
        }
      }),
      prisma.auditLog.create({
        data: {
          organizationId: req.organizationId,
          userId: req.user.id,
          userName: req.user.name,
          userRole: 'ADMIN',
          action: 'CREATE_MANAGER',
          details: `Admin created Manager "${name}" (${email.toLowerCase().trim()}).`,
          ipAddress: clientIp ? String(clientIp) : null
        }
      })
    ]);

    res.status(201).json({
      success: true,
      message: 'Manager created successfully',
      data: {
        id: manager.id,
        _id: manager.id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        department: manager.department,
        targetQuota: Number(manager.targetQuota),
        status: manager.status
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateManager = async (req, res, next) => {
  try {
    const { name, phone, department, targetQuota, status, password } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || null;

    const manager = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId,
        role: 'MANAGER'
      }
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager not found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department) updateData.department = department;
    if (targetQuota !== undefined) updateData.targetQuota = new Prisma.Decimal(targetQuota);
    if (status) updateData.status = status;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.params.id },
        data: updateData
      }),
      prisma.auditLog.create({
        data: {
          organizationId: req.organizationId,
          userId: req.user.id,
          userName: req.user.name,
          userRole: 'ADMIN',
          action: 'UPDATE_MANAGER',
          details: `Admin updated Manager "${manager.name}" (Status: ${status || manager.status}).`,
          ipAddress: clientIp ? String(clientIp) : null
        }
      })
    ]);

    const serialized = serializeEntity(updated);
    delete serialized.password;

    res.json({
      success: true,
      message: 'Manager updated successfully',
      data: serialized
    });
  } catch (error) {
    next(error);
  }
};

/**
 * MANAGER ONLY: Manage Sales Agents belonging to this Manager
 */
const getSalesAgents = async (req, res, next) => {
  try {
    const where = {
      organizationId: req.organizationId,
      role: 'SALES_AGENT'
    };

    if (req.user.role === 'MANAGER') {
      where.managerId = req.user.id;
    }

    const agents = await prisma.user.findMany({
      where,
      include: {
        assignedLeads: { select: { id: true } },
        assignedDeals: { select: { value: true, stage: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const agentsWithStats = agents.map((a) => {
      const assignedLeadsCount = a.assignedLeads.length;
      const wonDeals = a.assignedDeals.filter(d => d.stage === 'WON');
      const wonDealsCount = wonDeals.length;
      const wonRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);

      const serialized = serializeEntity(a);
      delete serialized.password;
      delete serialized.assignedLeads;
      delete serialized.assignedDeals;

      return {
        ...serialized,
        assignedLeadsCount,
        wonDealsCount,
        wonRevenue
      };
    });

    res.json({
      success: true,
      data: agentsWithStats
    });
  } catch (error) {
    next(error);
  }
};

const getSalesAgentById = async (req, res, next) => {
  try {
    const where = {
      id: req.params.id,
      organizationId: req.organizationId,
      role: 'SALES_AGENT'
    };

    if (req.user.role === 'MANAGER') {
      where.managerId = req.user.id;
    }

    const agent = await prisma.user.findFirst({
      where
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Sales Agent not found on your team'
      });
    }

    const leads = await prisma.lead.findMany({
      where: { assignedAgentId: agent.id }
    });
    const deals = await prisma.deal.findMany({
      where: { assignedAgentId: agent.id }
    });

    const wonRevenue = deals.filter(d => d.stage === 'WON').reduce((sum, d) => sum + Number(d.value), 0);
    const serializedAgent = serializeEntity(agent);
    delete serializedAgent.password;

    res.json({
      success: true,
      data: {
        agent: serializedAgent,
        stats: {
          leadsCount: leads.length,
          dealsCount: deals.length,
          wonRevenue
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const createSalesAgent = async (req, res, next) => {
  try {
    if (req.user.role !== 'MANAGER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Managers and Administrators are permitted to create Sales Agents.'
      });
    }

    if (req.body.role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Creating additional Administrator accounts is forbidden. An organization may only have exactly one Admin.'
      });
    }

    const { name, email, password, phone, department, targetQuota, managerId } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || null;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const assignedManagerId = req.user.role === 'MANAGER' ? req.user.id : (managerId || null);

    const [agent] = await prisma.$transaction([
      prisma.user.create({
        data: {
          organizationId: req.organizationId,
          managerId: assignedManagerId,
          name,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          phone: phone || null,
          department: department || 'Direct Sales',
          targetQuota: new Prisma.Decimal(targetQuota || 2000000),
          role: 'SALES_AGENT',
          status: 'ACTIVE'
        }
      }),
      prisma.auditLog.create({
        data: {
          organizationId: req.organizationId,
          userId: req.user.id,
          userName: req.user.name,
          userRole: 'MANAGER',
          action: 'CREATE_SALES_AGENT',
          details: `Manager ${req.user.name} created Sales Agent "${name}" (${email.toLowerCase().trim()}).`,
          ipAddress: clientIp ? String(clientIp) : null
        }
      })
    ]);

    res.status(201).json({
      success: true,
      message: 'Sales Agent created successfully',
      data: {
        id: agent.id,
        _id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        department: agent.department,
        targetQuota: Number(agent.targetQuota),
        status: agent.status
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateSalesAgent = async (req, res, next) => {
  try {
    const where = {
      id: req.params.id,
      organizationId: req.organizationId,
      role: 'SALES_AGENT'
    };

    if (req.user.role === 'MANAGER') {
      where.managerId = req.user.id;
    }

    const agent = await prisma.user.findFirst({
      where
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Sales Agent not found on your team'
      });
    }

    const { name, phone, department, targetQuota, status, password } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || null;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department) updateData.department = department;
    if (targetQuota !== undefined) updateData.targetQuota = new Prisma.Decimal(targetQuota);
    if (status) updateData.status = status;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.params.id },
        data: updateData
      }),
      prisma.auditLog.create({
        data: {
          organizationId: req.organizationId,
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'UPDATE_SALES_AGENT',
          details: `Updated Sales Agent "${agent.name}" (Status: ${status || agent.status}).`,
          ipAddress: clientIp ? String(clientIp) : null
        }
      })
    ]);

    const serialized = serializeEntity(updated);
    delete serialized.password;

    res.json({
      success: true,
      message: 'Sales Agent updated successfully',
      data: serialized
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getManagers,
  getManagerById,
  createManager,
  updateManager,
  getSalesAgents,
  getSalesAgentById,
  createSalesAgent,
  updateSalesAgent
};
