const prisma = require('../config/prisma');
const { serialize, serializeEntity } = require('../utils/serializer');

const getFollowUps = async (req, res, next) => {
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

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, companyName: true } },
        deal: { select: { id: true, title: true, value: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Compute active statuses dynamically relative to current date
    const serializedFollowUps = serialize(followUps);
    const processed = serializedFollowUps.map(obj => {
      if (obj.status !== 'COMPLETED') {
        const d = new Date(obj.dueDate);
        if (d < startOfToday) {
          obj.status = 'OVERDUE';
        } else if (d >= startOfToday && d <= endOfToday) {
          obj.status = 'TODAY';
        } else {
          obj.status = 'UPCOMING';
        }
      }
      return obj;
    });

    const categorized = {
      today: processed.filter(f => f.status === 'TODAY'),
      upcoming: processed.filter(f => f.status === 'UPCOMING'),
      overdue: processed.filter(f => f.status === 'OVERDUE'),
      completed: processed.filter(f => f.status === 'COMPLETED')
    };

    res.json({
      success: true,
      totalCount: processed.length,
      categorized,
      all: processed
    });
  } catch (error) {
    next(error);
  }
};

const createFollowUp = async (req, res, next) => {
  try {
    const { contactName, title, type, dueDate, time, priority, notes, leadId, dealId } = req.body;

    if (!contactName || !title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Contact name, follow-up title, and due date are required'
      });
    }

    const followUp = await prisma.followUp.create({
      data: {
        organizationId: req.organizationId,
        userId: req.user.id,
        leadId: leadId || null,
        dealId: dealId || null,
        contactName,
        title,
        type: type || 'CALL',
        dueDate: new Date(dueDate),
        time: time || '11:00 AM',
        priority: priority || 'MEDIUM',
        status: 'TODAY',
        notes: notes || ''
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, companyName: true } },
        deal: { select: { id: true, title: true, value: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up created successfully',
      data: serializeEntity(followUp)
    });
  } catch (error) {
    next(error);
  }
};

const updateFollowUp = async (req, res, next) => {
  try {
    const followUp = await prisma.followUp.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found'
      });
    }

    const { status, title, contactName, type, dueDate, time, priority, notes } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (contactName) updateData.contactName = contactName;
    if (type) updateData.type = type;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (time) updateData.time = time;
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.followUp.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, companyName: true } },
        deal: { select: { id: true, title: true, value: true } }
      }
    });

    res.json({
      success: true,
      message: 'Follow-up updated successfully',
      data: serializeEntity(updated)
    });
  } catch (error) {
    next(error);
  }
};

const deleteFollowUp = async (req, res, next) => {
  try {
    const followUp = await prisma.followUp.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found'
      });
    }

    await prisma.followUp.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp
};
