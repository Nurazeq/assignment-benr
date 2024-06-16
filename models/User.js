const express = require('express');
const router = express.Router();
const User = require('../models/User');

// CREATE a new user
router.post('/', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.json(newUser);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Other CRUD operations for User can be similarly implemented

module.exports = router;
