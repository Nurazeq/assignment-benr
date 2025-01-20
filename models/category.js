const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  option: String,
  isCorrect: Boolean
});

const QuestionSchema = new mongoose.Schema({
  question: String,
  type: String,
  options: [OptionSchema],
  score: Number
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  questions: [QuestionSchema]
});

module.exports = mongoose.model('Category', CategorySchema);
