const express = require('express');
const router = express.Router();
const {
  getManagers,
  getManagerById,
  createManager,
  updateManager,
  getSalesAgents,
  getSalesAgentById,
  createSalesAgent,
  updateSalesAgent
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');

// ADMIN ONLY: Manager Management (Strictly NO Sales Agent creation here)
router.get('/managers', protect, authorize('ADMIN'), getManagers);
router.post('/managers', protect, authorize('ADMIN'), createManager);
router.get('/managers/:id', protect, authorize('ADMIN'), getManagerById);
router.put('/managers/:id', protect, authorize('ADMIN'), updateManager);

// MANAGER (and Admin view-only): Sales Agent Management
// Note: Only MANAGER can POST to create a Sales Agent!
router.get('/sales-agents', protect, authorize('ADMIN', 'MANAGER'), getSalesAgents);
router.post('/sales-agents', protect, authorize('MANAGER'), createSalesAgent);
router.get('/sales-agents/:id', protect, authorize('ADMIN', 'MANAGER'), getSalesAgentById);
router.put('/sales-agents/:id', protect, authorize('MANAGER', 'ADMIN'), updateSalesAgent);

module.exports = router;
