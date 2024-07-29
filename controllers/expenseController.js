const Expense = require('../models/Expense');
const User = require('../models/User');
const calculation = require('../utils/calculation');
const validation = require('../utils/validation');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.addExpense = async (req, res) => {
  try {
    const { amount, description, splitMethod, participants, createdBy } = req.body;

    let splitDetails;
    if (splitMethod === 'equal') {
      splitDetails = calculation.calculateEqualSplit(amount, participants);
    } else if (splitMethod === 'exact') {
      splitDetails = calculation.calculateExactSplit(amount, participants);
    } else if (splitMethod === 'percentage') {
      if (!validation.validatePercentageSplit(participants)) {
        return res.status(400).json({ message: 'Percentages must add up to 100%' });
      }
      splitDetails = calculation.calculatePercentageSplit(amount, participants);
    }

    const expense = new Expense({
      amount,
      description,
      splitMethod,
      participants: splitDetails,
      createdBy
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserExpenses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const expenses = await Expense.find({ 'participants.user': userId }).populate('participants.user');
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOverallExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().populate('participants.user');
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.downloadBalanceSheet = async (req, res) => {
  try {
    // Fetch all expenses
    const expenses = await Expense.find().populate('participants.user');

    // Fetch all users
    const users = await User.find();

    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: 'balanceSheet.csv',
      header: [
        { id: 'user', title: 'User' },
        { id: 'totalAmountOwed', title: 'Total Amount Owed' },
        { id: 'totalExpenses', title: 'Total Expenses' }
      ]
    });

    // Calculate total amount owed and total expenses per user
    const userExpenses = users.map(user => {
      const userExpenses = expenses
        .flatMap(expense => expense.participants)
        .filter(participant => participant.user._id.toString() === user._id.toString());
      
      const totalAmountOwed = userExpenses.reduce((total, expense) => total + expense.amountOwed, 0);
      const totalExpenses = expenses.reduce((total, expense) => {
        const participant = expense.participants.find(part => part.user._id.toString() === user._id.toString());
        return total + (participant ? expense.amount : 0);
      }, 0);

      return {
        user: user.name,
        totalAmountOwed,
        totalExpenses
      };
    });

    // Write data to CSV
    await csvWriter.writeRecords(userExpenses);

    // Send CSV file as response
    res.download('balanceSheet.csv', 'balanceSheet.csv', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error sending file' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

