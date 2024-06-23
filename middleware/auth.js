const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).send('Access denied');
  }
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).send('Access denied');
    }
    req.user.role = user.role; // Assuming role is a field in your user model
    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};
