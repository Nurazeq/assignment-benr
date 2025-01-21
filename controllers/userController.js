import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js'; // Update the path to your User model
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Register a user and verify CAPTCHA
export const registerUser = async (req, res) => {
    const { username, email, password, token } = req.body;

    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Make sure this is in your .env file

    try {
        // Step 1: Verify CAPTCHA with Google's API
        const captchaResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: secretKey,
                response: token
            }
        });

        if (!captchaResponse.data.success) {
            return res.status(400).json({ message: 'CAPTCHA verification failed' });
        }

        // Step 2: Skip the password strength validation (no longer required)
        // No password validation regex applied here

        // Step 3: Save user data locally for debugging purposes
        const userData = { username, email, password, timestamp: new Date().toISOString() };
        const filePath = path.join(__dirname, '../logs/userData.json');
        fs.appendFile(filePath, JSON.stringify(userData) + '\n', (err) => {
            if (err) console.error('Failed to save user data locally:', err);
        });

        // Step 4: Register user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user with account locking after 3 failed attempts
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(403).json({
                message: 'Account is locked due to multiple failed login attempts. Please contact support or wait for the cooldown period.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 3) {
                user.isLocked = true;
                await user.save();
                return res.status(403).json({
                    message: 'Account locked due to multiple failed login attempts.'
                });
            }
            await user.save();
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Change password
export const changePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.send('Password updated');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        // Fetch user details from req.user (set by auth middleware)
        const user = req.user;
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            scores: user.scores // Include any other relevant user data
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Logout
export const logout = (req, res) => {
    res.send('Logged out');
};
