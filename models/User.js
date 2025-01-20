const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  role: { type: String, default: 'user' },
  scores: [
    {
      score: Number,
      questions_right: Number,
      category: String,
      date: { type: Date, default: Date.now }
    },
  ],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Reference to User model
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Convert email and username to lowercase before saving
UserSchema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  this.username = this.username.toLowerCase();
  next();
});

module.exports = mongoose.model('User', UserSchema);
