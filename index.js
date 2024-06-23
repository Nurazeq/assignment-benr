const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const userRoutes = require('./routes/user');
const quizRoutes = require('./routes/quiz');
const categoryRoutes = require('./routes/category');

app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/category', categoryRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
