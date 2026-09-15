const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const { serialize, serializeEntity } = require('../utils/serializer');

const getCompanies = async (req, res, next) => {
  try {
    const where = { organizationId: req.organizationId };

    if (req.query.search) {
      where.name = { contains: req.query.search.trim(), mode: 'insensitive' };
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        contacts: { select: { id: true } },
        deals: { select: { value: true } }
      },
      orderBy: { name: 'asc' }
    });

    const companiesWithStats = companies.map((c) => {
      const contactsCount = c.contacts.length;
      const dealsCount = c.deals.length;
      const totalValue = c.deals.reduce((sum, d) => sum + Number(d.value), 0);

      const serialized = serializeEntity(c);
      delete serialized.contacts;
      delete serialized.deals;

      return {
        ...serialized,
        contactsCount,
        dealsCount,
        totalValue
      };
    });

    res.json({
      success: true,
      count: companiesWithStats.length,
      data: companiesWithStats
    });
  } catch (error) {
    next(error);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const contacts = await prisma.contact.findMany({
      where: { companyId: company.id }
    });

    const deals = await prisma.deal.findMany({
      where: { companyId: company.id },
      include: {
        assignedAgent: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({
      success: true,
      data: {
        company: serializeEntity(company),
        contacts: serialize(contacts),
        deals: serialize(deals)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const { name, industry, website, phone, address, employeeCount, annualRevenue } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    const company = await prisma.company.create({
      data: {
        organizationId: req.organizationId,
        name,
        industry: industry || 'Technology',
        website: website || null,
        phone: phone || null,
        address: address || null,
        employeeCount: Number(employeeCount) || 50,
        annualRevenue: new Prisma.Decimal(annualRevenue || 0)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: serializeEntity(company)
    });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const { name, industry, website, phone, address, employeeCount, annualRevenue } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (industry) updateData.industry = industry;
    if (website !== undefined) updateData.website = website;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (employeeCount !== undefined) updateData.employeeCount = Number(employeeCount);
    if (annualRevenue !== undefined) updateData.annualRevenue = new Prisma.Decimal(annualRevenue);

    const updated = await prisma.company.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: serializeEntity(updated)
    });
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.organizationId
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    await prisma.company.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};
