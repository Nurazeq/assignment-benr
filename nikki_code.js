const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const User = require('./models/User');
const Question = require('./models/Question');
const Category = require('./models/Category');
const Score = require('./models/Score');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

/* User Routes */

// CREATE a new user
app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.json(newUser);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// READ all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// UPDATE a user by ID
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { username, email, password },
            { new: true }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// DELETE a user by ID
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/* Question Routes */

// CREATE a new question
app.post('/api/questions', async (req, res) => {
    const { question, options, correctOption, category } = req.body;
    try {
        const newQuestion = new Question({ question, options, correctOption, category });
        await newQuestion.save();
        res.json(newQuestion);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// READ all questions
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find().populate('category');
        res.json(questions);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// UPDATE a question by ID
app.put('/api/questions/:id', async (req, res) => {
    const { id } = req.params;
    const { question, options, correctOption, category } = req.body;
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { question, options, correctOption, category },
            { new: true }
        );
        res.json(updatedQuestion);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// DELETE a question by ID
app.delete('/api/questions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Question.findByIdAndDelete(id);
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/* Category Routes */

// CREATE a new category
app.post('/api/categories', async (req, res) => {
    const { name } = req.body;
    try {
        const newCategory = new Category({ name });
        await newCategory.save();
        res.json(newCategory);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// READ all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// UPDATE a category by ID
app.put('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );
        res.json(updatedCategory);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// DELETE a category by ID
app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Category.findByIdAndDelete(id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/* Score Routes */

// CREATE a new score
app.post('/api/scores', async (req, res) => {
    const { user, score } = req.body;
    try {
        const newScore = new Score({ user, score });
        await newScore.save();
        res.json(newScore);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// READ all scores
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find().populate('user');
        res.json(scores);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// UPDATE a score by ID
app.put('/api/scores/:id', async (req, res) => {
    const { id } = req.params;
    const { score } = req.body;
    try {
        const updatedScore = await Score.findByIdAndUpdate(
            id,
            { score },
            { new: true }
        );
        res.json(updatedScore);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// DELETE a score by ID
app.delete('/api/scores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Score.findByIdAndDelete(id);
        res.json({ message: 'Score deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))