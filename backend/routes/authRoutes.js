const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authorizeRole(['CITIZEN', 'HEALTH_OFFICIAL', 'ADMIN']), authController.updateProfile);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
