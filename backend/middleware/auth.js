const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'leadflow_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, missing session token'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact your CRM administrator.'
      });
    }

    // Attach both id and _id for complete compatibility across controllers
    user._id = user.id;
    if (user.targetQuota && typeof user.targetQuota.toNumber === 'function') {
      user.targetQuota = user.targetQuota.toNumber();
    }

    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired'
    });
  }
};

module.exports = { protect, JWT_SECRET };
