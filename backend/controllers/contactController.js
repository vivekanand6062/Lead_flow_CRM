const prisma = require('../config/prisma');
const { serialize, serializeEntity } = require('../utils/serializer');

const getContacts = async (req, res, next) => {
  try {
    const where = { organizationId: req.organizationId };

    if (req.user.role === 'SALES_AGENT') {
      where.OR = [{ assignedAgentId: req.user.id }, { assignedAgentId: null }];
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      const searchConditions = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } }
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

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, industry: true } },
        assignedAgent: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: contacts.length,
      data: serialize(contacts)
    });
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      },
      include: {
        company: { select: { id: true, name: true, industry: true, website: true, phone: true, address: true, employeeCount: true } },
        assignedAgent: { select: { id: true, name: true, email: true } }
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const deals = await prisma.deal.findMany({
      where: {
        organizationId: req.organizationId,
        contactId: contact.id
      }
    });

    const activities = await prisma.activity.findMany({
      where: {
        organizationId: req.organizationId,
        contactId: contact.id
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: {
        contact: serializeEntity(contact),
        deals: serialize(deals),
        activities: serialize(activities)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, designation, companyName, companyId, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required'
      });
    }

    let linkedCompanyId = companyId || null;
    let finalCompanyName = companyName || '';

    // If company name was provided but no ID, find or create
    if (!linkedCompanyId && companyName) {
      let existingCompany = await prisma.company.findFirst({
        where: {
          organizationId: req.organizationId,
          name: { equals: companyName.trim(), mode: 'insensitive' }
        }
      });
      if (!existingCompany) {
        existingCompany = await prisma.company.create({
          data: {
            organizationId: req.organizationId,
            name: companyName.trim()
          }
        });
      }
      linkedCompanyId = existingCompany.id;
      finalCompanyName = existingCompany.name;
    }

    const contact = await prisma.contact.create({
      data: {
        organizationId: req.organizationId,
        assignedAgentId: req.user.role === 'SALES_AGENT' ? req.user.id : null,
        companyId: linkedCompanyId,
        companyName: finalCompanyName,
        name,
        email: email || null,
        phone: phone || null,
        designation: designation || 'Executive',
        notes: notes || ''
      },
      include: {
        company: { select: { id: true, name: true, industry: true } },
        assignedAgent: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: serializeEntity(contact)
    });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const { name, email, phone, designation, companyName, notes } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (designation) updateData.designation = designation;
    if (companyName) updateData.companyName = companyName;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.contact.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        company: { select: { id: true, name: true, industry: true } },
        assignedAgent: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: serializeEntity(updated)
    });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await prisma.contact.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
