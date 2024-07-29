const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../utils/authMiddleware');

// Define routes for user operations
router.get('/users/:id', authMiddleware.authMiddleware, userController.getUserDetails);

module.exports = router;
