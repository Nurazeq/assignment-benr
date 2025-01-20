const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
<<<<<<< HEAD
const userController = require('../controllers/userController');
const rateLimit = require("express-rate-limit");
const logAction = require('../utils/logger'); // Import the utility

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

router.post('/register', async (req, res) => {
  const { name, username, email, password, age } = req.body;

  // Updated password validation with special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).send('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*?/.).');
  }

  try {
    // Check if email already exists
    const existingUserEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserEmail) {
      return res.status(400).send('Email already in use');
    }

    // Check if username already exists
    const existingUserUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUserUsername) {
      return res.status(400).send('Username already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      age
    });

    await newUser.save();
    res.status(201).send('User registered successfully. You can now log in.');
  } catch (error) {
    console.error(error); // Log the error to the console
    res.status(500).send('Server error');
  }
});

// Login with loginLimiter middleware
router.post('/login', loginLimiter, async (req, res) => {
=======

// Logger middleware
const logAction = (action, user) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${action} - User: ${user}`);
};

// Register
router.post('/register', async (req, res) => {
  const { name, username, email, password, age } = req.body;
  try {
    // Convert email and username to lowercase
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    // Check if the email or username already exists
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] });
    if (existingUser) {
      logAction('Registration failed - email or username already exists', email);
      return res.status(400).send('Email or username already in use');
    }

    const user = new User({ name, username: normalizedUsername, email: normalizedEmail, password, age });
    await user.save();
    logAction('Registered', normalizedUsername);
    res.status(201).send('User registered');
  } catch (error) {
    logAction('Registration failed', email);
    res.status(400).send(error);
  }
});

// Login
router.post('/login', async (req, res) => {
>>>>>>> bf6040df8c53b4e963dabe0240a4df2b3e7917be
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logAction('Login failed - invalid email', email);
<<<<<<< HEAD
      return res.status(400).send('Invalid Credentials. Please check your email or password.');
=======
      return res.status(400).send('Invalid credentials');
>>>>>>> bf6040df8c53b4e963dabe0240a4df2b3e7917be
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logAction('Login failed - invalid password', email);
<<<<<<< HEAD
      return res.status(400).send('Invalid Credentials. Please check your email or password.');
=======
      return res.status(400).send('Invalid credentials');
>>>>>>> bf6040df8c53b4e963dabe0240a4df2b3e7917be
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    logAction('Logged in', email);
    res.json({ token });
  } catch (error) {
    logAction('Login failed - server error', email);
<<<<<<< HEAD
    res.status(500).send('Server Error. Please try again later.');
  }
});

// Forget Password with error handling
=======
    res.status(500).send('Server error');
  }
});

// Forget Password
>>>>>>> bf6040df8c53b4e963dabe0240a4df2b3e7917be
router.post('/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logAction('Password reset failed - user not found', email);
<<<<<<< HEAD
      return res.status(400).send('User Not Found. Please check the email address.');
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    logAction('Password reset', email);
    res.send('Password Updated Successfully.');
  } catch (error) {
    logAction('Password reset failed - server error', email);
    res.status(500).send('Server Error. Please try again later.');
=======
      return res.status(400).send('User not found');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    logAction('Password reset', email);
    res.send('Password updated');
  } catch (error) {
    logAction('Password reset failed - server error', email);
    res.status(500).send('Server error');
>>>>>>> bf6040df8c53b4e963dabe0240a4df2b3e7917be
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

// View Friends' Scores (Public)
// router.get('/friends-scores/:username', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.username.toLowerCase() }).populate('friends', 'username scores');
//     if (!user) {
//       logAction('View friends scores failed - user not found', req.params.username);
//       return res.status(404).send('User not found');
//     }

//     const friendsScores = user.friends.map(friend => ({
//       username: friend.username,
//       scores: friend.scores.map(score => ({
//         category: score.category,
//         score: score.score,
//         questions_right: score.questions_right
//       }))
//     }));

//     res.json(friendsScores);
//   } catch (error) {
//     logAction('View friends scores failed - server error', req.params.username);
//     res.status(500).send('Server error');
//   }
// });

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
