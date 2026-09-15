const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const { assessDealRisk } = require('../services/aiService');
const { serialize, serializeEntity } = require('../utils/serializer');

const getDeals = async (req, res, next) => {
  try {
    const where = { organizationId: req.organizationId };

    if (req.user.role === 'SALES_AGENT') {
      where.assignedAgentId = req.user.id;
    } else if (req.user.role === 'MANAGER') {
      const teamAgents = await prisma.user.findMany({
        where: { managerId: req.user.id, role: 'SALES_AGENT' },
        select: { id: true }
      });
      const teamAgentIds = teamAgents.map(a => a.id);
      where.OR = [
        { assignedAgentId: { in: teamAgentIds } },
        { managerId: req.user.id },
        { assignedAgentId: req.user.id }
      ];
    }

    if (req.query.stage) {
      where.stage = req.query.stage;
    }
    if (req.query.agentId) {
      where.assignedAgentId = req.query.agentId;
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        assignedAgent: { select: { id: true, name: true, email: true, avatar: true } },
        manager: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, name: true, email: true, phone: true, designation: true } },
        company: { select: { id: true, name: true, industry: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      count: deals.length,
      data: serialize(deals)
    });
  } catch (error) {
    next(error);
  }
};

const getDealById = async (req, res, next) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      },
      include: {
        assignedAgent: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        manager: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, name: true, email: true, phone: true, designation: true } },
        company: { select: { id: true, name: true, industry: true, website: true, phone: true, address: true } },
        lead: { select: { id: true, name: true, email: true, companyName: true, status: true } }
      }
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const activities = await prisma.activity.findMany({
      where: {
        organizationId: req.organizationId,
        dealId: deal.id
      },
      include: {
        user: { select: { id: true, name: true, role: true, avatar: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: {
        deal: serializeEntity(deal),
        activities: serialize(activities)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createDeal = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      companyId,
      contactId,
      leadId,
      value,
      probability,
      stage,
      expectedCloseDate,
      assignedAgentId,
      notes
    } = req.body;

    if (!title || value === undefined || !expectedCloseDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, deal value, and expected close date are required.'
      });
    }

    let agentId = req.user.role === 'SALES_AGENT' ? req.user.id : (assignedAgentId || req.user.id);
    let managerId = null;

    if (agentId) {
      const agentUser = await prisma.user.findUnique({ where: { id: agentId } });
      if (agentUser) {
        managerId = agentUser.role === 'SALES_AGENT' ? agentUser.managerId : (req.user.role === 'MANAGER' ? req.user.id : null);
      }
    }

    const rawDeal = {
      title,
      stage: stage || 'QUALIFIED',
      probability: probability || 50,
      createdAt: new Date()
    };
    const riskData = await assessDealRisk(rawDeal, []);

    const result = await prisma.$transaction(async (tx) => {
      const deal = await tx.deal.create({
        data: {
          organizationId: req.organizationId,
          assignedAgentId: agentId,
          managerId,
          leadId: leadId || null,
          companyId: companyId || null,
          contactId: contactId || null,
          title,
          companyName: companyName || 'Enterprise Account',
          value: new Prisma.Decimal(value || 0),
          currency: 'INR',
          probability: Number(probability) || 50,
          stage: stage || 'QUALIFIED',
          status: stage === 'WON' ? 'WON' : (stage === 'LOST' ? 'LOST' : 'OPEN'),
          expectedCloseDate: new Date(expectedCloseDate),
          riskHealth: riskData.riskHealth,
          riskSignals: riskData.riskSignals,
          positiveSignals: riskData.positiveSignals,
          recommendedAction: riskData.recommendedAction,
          notes: notes || ''
        },
        include: {
          assignedAgent: { select: { id: true, name: true, email: true, avatar: true } },
          manager: { select: { id: true, name: true, email: true } },
          contact: { select: { id: true, name: true, email: true, phone: true, designation: true } },
          company: { select: { id: true, name: true, industry: true } }
        }
      });

      await tx.activity.create({
        data: {
          organizationId: req.organizationId,
          userId: req.user.id,
          dealId: deal.id,
          type: 'TASK',
          title: `Deal created: ${deal.title}`,
          relatedCustomer: deal.companyName,
          status: 'COMPLETED',
          notes: `Deal opened with initial value ₹${Number(deal.value).toLocaleString('en-IN')}.`
        }
      });

      return deal;
    });

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: serializeEntity(result)
    });
  } catch (error) {
    next(error);
  }
};

const updateDeal = async (req, res, next) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const {
      title,
      companyName,
      value,
      probability,
      stage,
      expectedCloseDate,
      assignedAgentId,
      notes
    } = req.body;

    const prevStage = deal.stage;
    const updateData = {};

    if (title) updateData.title = title;
    if (companyName) updateData.companyName = companyName;
    if (value !== undefined) updateData.value = new Prisma.Decimal(value);
    if (probability !== undefined) updateData.probability = Number(probability);
    if (stage) {
      updateData.stage = stage;
      if (stage === 'WON') updateData.status = 'WON';
      else if (stage === 'LOST') updateData.status = 'LOST';
      else updateData.status = 'OPEN';
    }
    if (expectedCloseDate) updateData.expectedCloseDate = new Date(expectedCloseDate);
    if (notes !== undefined) updateData.notes = notes;

    if (assignedAgentId && req.user.role !== 'SALES_AGENT') {
      updateData.assignedAgentId = assignedAgentId;
      const agentUser = await prisma.user.findUnique({ where: { id: assignedAgentId } });
      if (agentUser) updateData.managerId = agentUser.managerId;
    }

    // Refresh AI risk assessment
    const activities = await prisma.activity.findMany({ where: { dealId: deal.id } });
    const riskData = await assessDealRisk({ ...deal, ...updateData }, activities);
    updateData.riskHealth = riskData.riskHealth;
    updateData.riskSignals = riskData.riskSignals;
    updateData.positiveSignals = riskData.positiveSignals;
    updateData.recommendedAction = riskData.recommendedAction;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.deal.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          assignedAgent: { select: { id: true, name: true, email: true, avatar: true } },
          manager: { select: { id: true, name: true, email: true } },
          contact: { select: { id: true, name: true, email: true, phone: true, designation: true } },
          company: { select: { id: true, name: true, industry: true } }
        }
      });

      if (stage && stage !== prevStage) {
        await tx.activity.create({
          data: {
            organizationId: req.organizationId,
            userId: req.user.id,
            dealId: deal.id,
            type: 'NOTE',
            title: `Deal moved to ${stage}`,
            relatedCustomer: updated.companyName,
            status: 'COMPLETED',
            notes: `Pipeline stage moved from ${prevStage} to ${stage}.`
          }
        });
      }

      return updated;
    });

    res.json({
      success: true,
      message: 'Deal updated successfully',
      data: serializeEntity(result)
    });
  } catch (error) {
    next(error);
  }
};

const deleteDeal = async (req, res, next) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    await prisma.deal.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
};
