const express = require('express');
const router = express.Router();
const {
  getLeadScore,
  getLeadSummary,
  getFollowUpDraft,
  getDealRisk,
  getSalesInsights
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/lead-score', getLeadScore);
router.post('/lead-summary', getLeadSummary);
router.post('/follow-up-draft', getFollowUpDraft);
router.post('/followup-draft', getFollowUpDraft);
router.post('/deal-risk', getDealRisk);
router.get('/sales-insights', getSalesInsights);

module.exports = router;
