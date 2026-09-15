const prisma = require('../config/prisma');
const { serialize } = require('../utils/serializer');

const getSettings = async (req, res, next) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.organizationId }
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: req.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 25
    });

    res.json({
      success: true,
      data: {
        organization: serialize(organization),
        auditLogs: serialize(auditLogs)
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { name, industry, email, phone, website, address, currency } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || null;

    const existing = await prisma.organization.findUnique({
      where: { id: req.organizationId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (industry) updateData.industry = industry;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (address !== undefined) updateData.address = address;
    if (currency) updateData.currency = currency;

    const [organization] = await prisma.$transaction([
      prisma.organization.update({
        where: { id: req.organizationId },
        data: updateData
      }),
      prisma.auditLog.create({
        data: {
          organizationId: req.organizationId,
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'UPDATE_ORGANIZATION_SETTINGS',
          details: `Organization profile updated by Admin ${req.user.name}.`,
          ipAddress: clientIp ? String(clientIp) : null
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Organization settings saved successfully',
      data: serialize(organization)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
