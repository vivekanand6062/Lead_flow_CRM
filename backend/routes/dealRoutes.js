const express = require('express');
const router = express.Router();
const {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
} = require('../controllers/dealController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getDeals);
router.post('/', createDeal);
router.get('/:id', getDealById);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

module.exports = router;
