const express = require('express');
const router = express.Router();
const {
  getActivities,
  createActivity,
  deleteActivity
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getActivities);
router.post('/', createActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
