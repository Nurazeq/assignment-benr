const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const port = process.env.PORT || 3000;
const saltRounds = 10
var jwt = require('jsonwebtoken');

app.use(express.json())

const User = require('./models/User');
const Question = require('./models/Question');
const Category = require('./models/Category');
const Score = require('./models/Score');

// Connect to MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://nikkii:nik123@nikki.uimfopa.mongodb.net/?retryWrites=true&w=majority&appName=Nikki";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");



// /* User Routes */

// // CREATE a new user
// app.post('/api/users', async (req, res) => {
//     const { username, email, password } = req.body;
//     try {
//         const newUser = new User({ username, email, password });
//         await newUser.save();
//         res.json(newUser);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // READ all users
// app.get('/api/users', async (req, res) => {
//     try {
//         const users = await User.find();
//         res.json(users);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // UPDATE a user by ID
// app.put('/api/users/:id', async (req, res) => {
//     const { id } = req.params;
//     const { username, email, password } = req.body;
//     try {
//         const updatedUser = await User.findByIdAndUpdate(
//             id,
//             { username, email, password },
//             { new: true }
//         );
//         res.json(updatedUser);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // DELETE a user by ID
// app.delete('/api/users/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         await User.findByIdAndDelete(id);
//         res.json({ message: 'User deleted' });
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

/* Question Routes */

// CREATE a new question
// app.post('/api/questions', async (req, res) => {
//     const { question, options, correctOption, category } = req.body;
//     try {
//         const newQuestion = new Question({ question, options, correctOption, category });
//         await newQuestion.save();
//         res.json(newQuestion);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // READ all questions
// app.get('/api/questions', async (req, res) => {
//     try {
//         const questions = await Question.find().populate('category');
//         res.json(questions);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // UPDATE a question by ID
// app.put('/api/questions/:id', async (req, res) => {
//     const { id } = req.params;
//     const { question, options, correctOption, category } = req.body;
//     try {
//         const updatedQuestion = await Question.findByIdAndUpdate(
//             id,
//             { question, options, correctOption, category },
//             { new: true }
//         );
//         res.json(updatedQuestion);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // DELETE a question by ID
// app.delete('/api/questions/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         await Question.findByIdAndDelete(id);
//         res.json({ message: 'Question deleted' });
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

/* Category Routes */

// CREATE a new category
app.post('/createCategory', async (req, res) => {
    try {
      let result = await client.db("NikkiOng").collection("Category").insertOne({
        category: req.body.category
      });
      res.send("Category created successfully");
    } catch (err) {
      console.error("Error creating category: ", err);
      res.status(500).send("Error creating category");
    }
});
  

// READ all categories
app.get('/getCategories', async (req, res) => {
    try {
      let categories = await client.db('NikkiOng').collection('Category').find().toArray();
      res.send(categories);
    } catch (err) {
      console.error("Error fetching categories: ", err);
      res.status(500).send("Error fetching categories");
    }
});
  

// UPDATE a category by ID
app.patch('/updateCategory', async (req, res) => {
    try {
      const { currentCategory, updatedCategory } = req.body;
  
      const updateResult = await client.db("NikkiOng").collection("Category").updateOne(
        { category: currentCategory },
        { $set: { category: updatedCategory } }
      );
  
      if (updateResult.modifiedCount === 1) {
        res.send("Category updated successfully");
      } else {
        res.status(500).send("Failed to update category");
      }
    } catch (err) {
      console.error("Error updating category: ", err);
      res.status(500).send('Internal server error');
    }
});
  

// DELETE a category by ID
app.delete("/deleteCategory/:category", async (req, res) => {
    try {
      const category = req.params.category;
  
      const deleteResult = await client.db('NikkiOng').collection('Category').deleteOne({ category: category });
  
      if (deleteResult.deletedCount === 1) {
        res.send("Category deleted successfully");
      } else {
        res.status(404).send("Category not found");
      }
    } catch (err) {
      console.error("Error deleting category: ", err);
      res.status(500).send("Internal server error");
    }
});
  

/* Score Routes */

// CREATE a new score
// app.post('/api/scores', async (req, res) => {
//     const { user, score } = req.body;
//     try {
//         const newScore = new Score({ user, score });
//         await newScore.save();
//         res.json(newScore);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // READ all scores
// app.get('/api/scores', async (req, res) => {
//     try {
//         const scores = await Score.find().populate('user');
//         res.json(scores);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // UPDATE a score by ID
// app.put('/api/scores/:id', async (req, res) => {
//     const { id } = req.params;
//     const { score } = req.body;
//     try {
//         const updatedScore = await Score.findByIdAndUpdate(
//             id,
//             { score },
//             { new: true }
//         );
//         res.json(updatedScore);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // DELETE a score by ID
// app.delete('/api/scores/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         await Score.findByIdAndDelete(id);
//         res.json({ message: 'Score deleted' });
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// Start the server
} finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
