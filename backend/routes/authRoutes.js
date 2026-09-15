const express = require('express');
const router = express.Router();
const { login, getMe, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { forgotPasswordLimiter } = require('../middleware/rateLimiter');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Password Reset endpoints
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Dev/Test helper: Reset rate limiter (active in development/test only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev-reset-rate-limit', (req, res) => {
    const { resetRateLimiter } = require('../middleware/rateLimiter');
    resetRateLimiter();
    res.json({ success: true, message: 'Rate limiter reset' });
  });
}

module.exports = router;
