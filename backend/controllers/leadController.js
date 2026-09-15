const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const { scoreLead } = require('../services/aiService');
const { serialize, serializeEntity } = require('../utils/serializer');

// Get leads based on role context
const getLeads = async (req, res, next) => {
  try {
    const where = { organizationId: req.organizationId };

    if (req.user.role === 'SALES_AGENT') {
      // Sales Agent sees only their assigned leads
      where.assignedAgentId = req.user.id;
    } else if (req.user.role === 'MANAGER') {
      // Manager sees leads assigned to their team agents OR assigned to themselves
      const teamAgents = await prisma.user.findMany({
        where: { managerId: req.user.id, role: 'SALES_AGENT' },
        select: { id: true }
      });
      const teamAgentIds = teamAgents.map(a => a.id);
      where.OR = [
        { assignedAgentId: { in: teamAgentIds } },
        { managerId: req.user.id },
        { assignedAgentId: null }
      ];
    }

    // Optional filters: status, search
    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      const searchConditions = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      count: leads.length,
      data: serialize(leads)
    });
  } catch (error) {
    next(error);
  }
};

// Get single lead with timeline activities & linked deals
const getLeadById = async (req, res, next) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      },
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true, phone: true, avatar: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Agent access check
    if (req.user.role === 'SALES_AGENT' && lead.assignedAgentId && lead.assignedAgentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not assigned to this lead.'
      });
    }

    const activities = await prisma.activity.findMany({
      where: {
        organizationId: req.organizationId,
        leadId: lead.id
      },
      include: {
        user: { select: { id: true, name: true, role: true, avatar: true } }
      },
      orderBy: { date: 'desc' }
    });

    const deals = await prisma.deal.findMany({
      where: {
        organizationId: req.organizationId,
        leadId: lead.id
      }
    });

    res.json({
      success: true,
      data: {
        lead: serializeEntity(lead),
        activities: serialize(activities),
        deals: serialize(deals)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new lead
const createLead = async (req, res, next) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      status,
      leadSource,
      estimatedValue,
      assignedAgentId,
      notes
    } = req.body;

    if (!name || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Lead name and company name are required.'
      });
    }

    let assignedAgent = null;
    let managerId = null;

    if (req.user.role === 'SALES_AGENT') {
      assignedAgent = req.user.id;
      managerId = req.user.managerId;
    } else if (assignedAgentId) {
      assignedAgent = assignedAgentId;
      const agentUser = await prisma.user.findUnique({ where: { id: assignedAgentId } });
      if (agentUser) managerId = agentUser.managerId;
    } else if (req.user.role === 'MANAGER') {
      managerId = req.user.id;
    }

    // Generate initial AI score
    const aiScoreResult = await scoreLead({
      name,
      companyName,
      email,
      status: status || 'NEW',
      estimatedValue: Number(estimatedValue) || 0
    });

    const result = await prisma.$transaction(async (tx) => {
      const newLead = await tx.lead.create({
        data: {
          organizationId: req.organizationId,
          assignedAgentId: assignedAgent,
          managerId,
          name,
          companyName,
          email: email || null,
          phone: phone || null,
          status: status || 'NEW',
          leadSource: leadSource || 'Website',
          estimatedValue: new Prisma.Decimal(estimatedValue || 0),
          leadScore: aiScoreResult.leadScore,
          intentLevel: aiScoreResult.intentLevel,
          scoreSignals: aiScoreResult.scoreSignals,
          scoreReasoning: aiScoreResult.scoreReasoning,
          notes: notes || ''
        },
        include: {
          assignedAgent: { select: { id: true, name: true, email: true, avatar: true } },
          manager: { select: { id: true, name: true, email: true } }
        }
      });

      await tx.activity.create({
        data: {
          organizationId: req.organizationId,
          userId: req.user.id,
          leadId: newLead.id,
          type: 'TASK',
          title: 'Lead Created',
          relatedCustomer: `${newLead.name} (${newLead.companyName})`,
          status: 'COMPLETED',
          notes: `Lead created with initial score of ${newLead.leadScore}/100.`
        }
      });

      return newLead;
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: serializeEntity(result)
    });
  } catch (error) {
    next(error);
  }
};

// Update lead (status, agent assignment, notes, etc.)
const updateLead = async (req, res, next) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const {
      name,
      companyName,
      email,
      phone,
      status,
      leadSource,
      estimatedValue,
      assignedAgentId,
      notes,
      nextFollowUpDate
    } = req.body;

    const previousStatus = lead.status;
    const updateData = { lastActivityDate: new Date() };

    if (name) updateData.name = name;
    if (companyName) updateData.companyName = companyName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (status) updateData.status = status;
    if (leadSource) updateData.leadSource = leadSource;
    if (estimatedValue !== undefined) updateData.estimatedValue = new Prisma.Decimal(estimatedValue);
    if (notes !== undefined) updateData.notes = notes;
    if (nextFollowUpDate !== undefined) updateData.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;

    if (assignedAgentId !== undefined && req.user.role !== 'SALES_AGENT') {
      updateData.assignedAgentId = assignedAgentId || null;
      if (assignedAgentId) {
        const agentUser = await prisma.user.findUnique({ where: { id: assignedAgentId } });
        if (agentUser) updateData.managerId = agentUser.managerId;
      }
    }

    // Recalculate AI score
    const activities = await prisma.activity.findMany({ where: { leadId: lead.id } });
    const aiScoreResult = await scoreLead({ ...lead, ...updateData }, activities);
    updateData.leadScore = aiScoreResult.leadScore;
    updateData.intentLevel = aiScoreResult.intentLevel;
    updateData.scoreSignals = aiScoreResult.scoreSignals;
    updateData.scoreReasoning = aiScoreResult.scoreReasoning;

    const updatedLead = await prisma.$transaction(async (tx) => {
      const resLead = await tx.lead.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          assignedAgent: { select: { id: true, name: true, email: true, avatar: true } },
          manager: { select: { id: true, name: true, email: true } }
        }
      });

      if (status && status !== previousStatus) {
        await tx.activity.create({
          data: {
            organizationId: req.organizationId,
            userId: req.user.id,
            leadId: lead.id,
            type: 'NOTE',
            title: `Stage changed to ${status}`,
            relatedCustomer: `${resLead.name} (${resLead.companyName})`,
            status: 'COMPLETED',
            notes: `Stage progressed from ${previousStatus} to ${status}.`
          }
        });
      }

      return resLead;
    });

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: serializeEntity(updatedLead)
    });
  } catch (error) {
    next(error);
  }
};

// Delete lead
const deleteLead = async (req, res, next) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await prisma.lead.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
};
