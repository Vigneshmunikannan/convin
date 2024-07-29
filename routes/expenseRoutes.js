const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../utils/authMiddleware');

router.post('/expenses',authMiddleware.authMiddleware, expenseController.addExpense);
router.get('/expenses/user/:userId', authMiddleware.authMiddleware,expenseController.getUserExpenses);
router.get('/expenses', authMiddleware.authMiddleware,expenseController.getOverallExpenses);
router.get('/expenses/balance-sheet',authMiddleware.authMiddleware, expenseController.downloadBalanceSheet);

module.exports = router;
