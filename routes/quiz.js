const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Category = require('../models/category');

// Get all categories (public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({}).select('-questions.options.isCorrect');
    res.json(categories);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get questions for a category by name (public)
router.get('/categories/:categoryName', async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.categoryName });
    if (!category) {
      return res.status(404).send('Category not found');
    }

    // Remove `isCorrect` from options
    const questions = category.questions.map(question => {
      return {
        _id: question._id,
        question: question.question,
        type: question.type,
        options: question.options.map(option => ({
          option: option.option
        })),
        score: question.score
      };
    });

    res.json(questions);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Submit answers and calculate score (public)
router.post('/submit', async (req, res) => {
  const { username, categoryName, answers } = req.body;
  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).send('Category not found');
    }

    let score = 0;
    let questionsRight = 0;

    category.questions.forEach((question, index) => {
      if (question.options.some(option => option.isCorrect && option.option === answers[index])) {
        score += question.score;
        questionsRight++;
      }
    });

    const existingScore = user.scores.find(s => s.category === category.name);
    if (existingScore) {
      existingScore.score += score;
      existingScore.questions_right += questionsRight;
    } else {
      user.scores.push({ score, questions_right: questionsRight, category: category.name });
    }
    await user.save();

    res.json({ score, questionsRight, category: category.name });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
