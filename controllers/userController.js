const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const user = new User({ name, username, email, password });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.changePassword = async (req, res) => {
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

exports.getProfile = async (req, res) => {
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

exports.logout = (req, res) => {
    res.send('Logged out');
};
