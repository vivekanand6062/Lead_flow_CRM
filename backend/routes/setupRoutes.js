const express = require('express');
const router = express.Router();
const { getSetupStatus, completeSetup, seedDemoData } = require('../controllers/setupController');

router.get('/status', getSetupStatus);
router.post('/', completeSetup);
router.post('/seed', seedDemoData);

module.exports = router;
