const prisma = require('../config/prisma');
const { serialize, serializeEntity } = require('../utils/serializer');

const getActivities = async (req, res, next) => {
  try {
    const where = { organizationId: req.organizationId };

    if (req.user.role === 'SALES_AGENT') {
      where.userId = req.user.id;
    } else if (req.user.role === 'MANAGER') {
      const teamAgents = await prisma.user.findMany({
        where: { managerId: req.user.id, role: 'SALES_AGENT' },
        select: { id: true }
      });
      const teamAgentIds = teamAgents.map(a => a.id);
      where.OR = [
        { userId: { in: teamAgentIds } },
        { userId: req.user.id }
      ];
    }

    if (req.query.type) {
      where.type = req.query.type;
    }
    if (req.query.leadId) {
      where.leadId = req.query.leadId;
    }
    if (req.query.dealId) {
      where.dealId = req.query.dealId;
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        lead: { select: { id: true, name: true, companyName: true } },
        deal: { select: { id: true, title: true, value: true } }
      },
      orderBy: { date: 'desc' },
      take: 100
    });

    res.json({
      success: true,
      count: activities.length,
      data: serialize(activities)
    });
  } catch (error) {
    next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const { type, title, relatedCustomer, leadId, dealId, contactId, notes, date, status } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Activity type and title are required'
      });
    }

    const activity = await prisma.activity.create({
      data: {
        organizationId: req.organizationId,
        userId: req.user.id,
        leadId: leadId || null,
        dealId: dealId || null,
        contactId: contactId || null,
        type,
        title,
        relatedCustomer: relatedCustomer || '',
        notes: notes || '',
        date: date ? new Date(date) : new Date(),
        status: status || 'COMPLETED'
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        lead: { select: { id: true, name: true, companyName: true } },
        deal: { select: { id: true, title: true, value: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Activity recorded successfully',
      data: serializeEntity(activity)
    });
  } catch (error) {
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const activity = await prisma.activity.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await prisma.activity.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Activity removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  createActivity,
  deleteActivity
};
