const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', authenticateToken, authorizeRole(['ADMIN', 'HEALTHCARE_WORKER', 'HEALTH_OFFICIAL']), userController.getRegistrationOverview);
router.get('/', authenticateToken, authorizeRole(['ADMIN', 'HEALTH_OFFICIAL']), userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN']), userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), userController.deleteUser);

module.exports = router;
