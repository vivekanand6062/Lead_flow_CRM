const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// Check if setup is already completed
const getSetupStatus = async (req, res, next) => {
  try {
    const org = await prisma.organization.findFirst({
      where: { setupCompleted: true }
    });
    res.json({
      success: true,
      setupCompleted: Boolean(org),
      organizationName: org ? org.name : null
    });
  } catch (error) {
    next(error);
  }
};

// Initial system setup: Organization + Admin creation (atomic transaction)
const completeSetup = async (req, res, next) => {
  try {
    const existingOrg = await prisma.organization.findFirst({
      where: { setupCompleted: true }
    });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'System setup has already been completed. This route is locked permanently.'
      });
    }

    const {
      companyName,
      industry,
      businessEmail,
      companyPhone,
      website,
      address,
      logo,
      adminName,
      adminEmail,
      adminPhone,
      password,
      confirmPassword
    } = req.body;

    if (!companyName || !adminName || !adminEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required company and admin fields.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    // Atomic transaction across Organization, Admin User, and Audit Log
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: companyName,
          industry: industry || 'Technology',
          email: businessEmail || null,
          phone: companyPhone || null,
          website: website || null,
          address: address || null,
          logo: logo || '',
          setupCompleted: true
        }
      });

      const adminUser = await tx.user.create({
        data: {
          organizationId: organization.id,
          name: adminName,
          email: adminEmail.toLowerCase().trim(),
          password: hashedPassword,
          phone: adminPhone || null,
          role: 'ADMIN',
          department: 'Executive Leadership',
          status: 'ACTIVE'
        }
      });

      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: adminUser.id,
          userName: adminUser.name,
          userRole: 'ADMIN',
          action: 'INITIAL_SYSTEM_SETUP',
          details: `Organization "${organization.name}" and Admin account "${adminUser.email}" initialized.`,
          ipAddress: typeof clientIp === 'string' ? clientIp : String(clientIp)
        }
      });

      return { organization, adminUser };
    });

    res.status(201).json({
      success: true,
      message: 'Initial organization and Admin setup completed successfully. Please sign in.',
      organization: {
        id: result.organization.id,
        _id: result.organization.id,
        name: result.organization.name
      },
      admin: {
        id: result.adminUser.id,
        _id: result.adminUser.id,
        email: result.adminUser.email,
        name: result.adminUser.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// Quick seed demo data for instant evaluation / testing
const seedDemoData = async (req, res, next) => {
  try {
    const { execSync } = require('child_process');
    execSync('npx prisma db seed', { stdio: 'inherit', cwd: process.cwd() });
    res.json({
      success: true,
      message: 'Database seeded successfully with demo organization, managers, agents, leads, and deals.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSetupStatus,
  completeSetup,
  seedDemoData
};
