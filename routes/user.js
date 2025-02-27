const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const logAction = require('../utils/logger'); // Import the utility
const rateLimit = require("express-rate-limit");  

// Define rate limiting for login with enhanced message
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  handler: (req, res, next, options) => {
    logAction('Rate limit exceeded for login', req.ip);
    res.status(429).send(`Too Many Attempts. Please try again after some time.`);  // Custom message for rate limit exceeded
  }
});

// Register User
router.post('/register', async (req, res) => {
  const { name, username, email, password, age } = req.body;
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logAction('Registration failed - email already exists', email);
      return res.status(400).send('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      logAction('Registration failed - username already exists', username);
      return res.status(400).send('Username already taken');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      age
    });

    // Save the user to the database
    await newUser.save();
    logAction('User registered', email);

    // Send success response
    res.status(201).send('User registered successfully');
  } catch (error) {
    logAction('Registration failed - server error', email);
    res.status(500).send('Server error');
  }
});

// Login route with rate limiter
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logAction('Login failed - invalid email', email);
      return res.status(400).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logAction('Login failed - invalid password', email);
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    logAction('Logged in', email);
    res.json({ token });
  } catch (error) {
    logAction('Login failed - server error', email);
    res.status(500).send('Server error');
  }
});

// Forget Password
router.post('/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logAction('Password reset failed - user not found', email);
      return res.status(400).send('User not found');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    logAction('Password reset', email);
    res.send('Password updated');
  } catch (error) {
    logAction('Password reset failed - server error', email);
    res.status(500).send('Server error');
  }
});

// View Profile (Public)
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('-password').populate('friends', 'username');
    if (!user) {
      logAction('Profile view failed - user not found', req.params.username);
      return res.status(404).send('User not found');
    }

    // Calculate total score and total questions right
    const totalScore = user.scores.reduce((acc, scoreEntry) => acc + scoreEntry.score, 0);
    const totalQuestionsRight = user.scores.reduce((acc, scoreEntry) => acc + scoreEntry.questions_right, 0);

    const userProfile = {
      ...user.toObject(),
      totalScore,
      totalQuestionsRight,
      friendsCount: user.friends.length,
      friends: user.friends.map(friend => friend.username)
    };

    logAction('Viewed profile', req.params.username);
    res.json(userProfile);
  } catch (error) {
    logAction('Profile view failed - server error', req.params.username);
    res.status(500).send('Server error');
  }
});

// Add Friend (Public)
router.post('/add-friend', async (req, res) => {
  const { username, friendUsername } = req.body;
  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    const friend = await User.findOne({ username: friendUsername.toLowerCase() });

    if (!friend) {
      logAction('Add friend failed - friend not found', username);
      return res.status(404).send('Friend not found');
    }

    if (user.friends.includes(friend._id)) {
      return res.status(400).send('Friend already added');
    }

    user.friends.push(friend._id);
    await user.save();

    logAction('Added friend', friendUsername);
    res.send('Friend added');
  } catch (error) {
    logAction('Add friend failed - server error', username);
    res.status(500).send('Server error');
  }
});

// Remove Friend (Auth required)
router.post('/remove-friend', auth, async (req, res) => {
  const { friendUsername } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    const friend = await User.findOne({ username: friendUsername.toLowerCase() });

    if (!friend) {
      logAction('Remove friend failed - friend not found', req.user.userId);
      return res.status(404).send('Friend not found');
    }

    user.friends = user.friends.filter(friendId => friendId.toString() !== friend._id.toString());
    await user.save();

    logAction('Removed friend', friendUsername);
    res.send('Friend removed');
  } catch (error) {
    logAction('Remove friend failed - server error', req.user.userId);
    res.status(500).send('Server error');
  }
});

// Logout (No token required)
router.post('/logout', (req, res) => {
  logAction('Logged out', 'Anonymous');
  res.send('User logged out');
});

// Update User (Auth required)
router.put('/update', auth, async (req, res) => {
  const { name, username, email } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      logAction('Update failed - user not found', req.user.userId);
      return res.status(404).send('User not found');
    }

    if (name) user.name = name;
    if (username) user.username = username.toLowerCase();
    if (email) user.email = email.toLowerCase();

    await user.save();
    logAction('Updated profile', req.user.userId);
    res.send('User updated');
  } catch (error) {
    logAction('Update failed - server error', req.user.userId);
    res.status(500).send('Server error');
  }
});

// Delete User (Admin required)
router.delete('/delete/:userId', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    logAction('Delete failed - insufficient permissions', req.user.userId);
    return res.status(403).send('Access denied');
  }

  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      logAction('Delete failed - user not found', userId);
      return res.status(404).send('User not found');
    }
    logAction('Deleted user', userId);
    res.send('User deleted');
  } catch (error) {
    logAction('Delete failed - server error', userId);
    res.status(500).send('Server error');
  }
});

// Delete Own Account (Auth required)
router.delete('/delete', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      logAction('Delete own account failed - user not found', req.user.userId);
      return res.status(404).send('User not found');
    }
    logAction('Deleted own account', req.user.userId);
    res.send('Account deleted');
  } catch (error) {
    logAction('Delete own account failed - server error', req.user.userId);
    res.status(500).send('Server error');
  }
});

module.exports = router;
