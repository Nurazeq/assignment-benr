const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Middleware to check if the user is admin
async function checkAdmin(req, res, next) {
  const user = await User.findById(req.user.userId);
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Access denied');
  }
}

// Add a new category (Admin only)
router.post('/add-category', auth, checkAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const category = new Category({ name });
    await category.save();
    res.status(201).send('Category added');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Add a question to an existing category by name (Admin only)
router.post('/add-question', auth, checkAdmin, async (req, res) => {
  const { categoryName, question, type, options, score } = req.body;
  try {
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).send('Category not found');
    }
    category.questions.push({ question, type, options, score });
    await category.save();
    res.status(201).send('Question added');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Delete a category by name (Admin only)
router.delete('/delete-category/:categoryName', auth, checkAdmin, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ name: req.params.categoryName });
    if (!category) {
      return res.status(404).send('Category not found');
    }
    res.send('Category deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Delete a question from a category (Admin only)
router.delete('/delete-question', auth, checkAdmin, async (req, res) => {
  const { categoryName, questionId } = req.body;
  try {
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).send('Category not found');
    }

    const questionIndex = category.questions.findIndex(q => q._id.toString() === questionId);
    if (questionIndex === -1) {
      return res.status(404).send('Question not found');
    }

    category.questions.splice(questionIndex, 1);
    await category.save();
    res.send('Question deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
