const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../middleware/auth');

// Check if real organization initial setup is completed
const getSetupStatus = async (req, res, next) => {
  try {
    const realOrg = await prisma.organization.findFirst({
      where: {
        isDemo: false,
        setupCompleted: true
      }
    });
    res.json({
      success: true,
      setupCompleted: Boolean(realOrg),
      organizationName: realOrg ? realOrg.name : null
    });
  } catch (error) {
    next(error);
  }
};

// One-Time Initial Real Setup: Organization + Primary Admin creation (atomic transaction)
const completeSetup = async (req, res, next) => {
  try {
    // 1. Check if real organization setup is already completed
    const existingRealOrg = await prisma.organization.findFirst({
      where: {
        isDemo: false,
        setupCompleted: true
      }
    });

    if (existingRealOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization setup is already completed. This route is locked permanently.'
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
        message: 'Please provide Organization Name, Admin Name, Admin Email, and Password.'
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

    const normalizedEmail = adminEmail.toLowerCase().trim();

    // Check if email is already registered across any organization
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists. Please use a unique email.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    // Atomic transaction across Real Organization, Primary Admin User, and Audit Log
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: companyName.trim(),
          industry: industry || 'Technology',
          email: businessEmail || normalizedEmail,
          phone: companyPhone || adminPhone || null,
          website: website || null,
          address: address || null,
          logo: logo || '',
          isDemo: false,
          setupCompleted: true
        }
      });

      const adminUser = await tx.user.create({
        data: {
          organizationId: organization.id,
          name: adminName.trim(),
          email: normalizedEmail,
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
          details: `Real Organization "${organization.name}" and Primary Admin account "${adminUser.email}" initialized.`,
          ipAddress: typeof clientIp === 'string' ? clientIp : String(clientIp)
        }
      });

      return { organization, adminUser };
    });

    // Auto-authenticate Admin on successful setup
    const token = jwt.sign(
      {
        id: result.adminUser.id,
        role: 'ADMIN',
        organizationId: result.organization.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Real Organization and Primary Admin created successfully.',
      token,
      organization: {
        id: result.organization.id,
        _id: result.organization.id,
        name: result.organization.name
      },
      user: {
        id: result.adminUser.id,
        _id: result.adminUser.id,
        name: result.adminUser.name,
        email: result.adminUser.email,
        phone: result.adminUser.phone,
        role: 'ADMIN',
        organizationId: result.organization.id,
        organizationName: result.organization.name
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
