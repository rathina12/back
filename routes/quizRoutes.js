const express = require('express');
const jwt = require('jsonwebtoken');
const Quiz = require('../models/quizModel');
const router = express.Router();

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized, token missing' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized, invalid token' });
  }
};

router.post('/create', authenticateUser, async (req, res) => {
  const { title, questions } = req.body;

  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ message: "Title and questions are required." });
  }

  try {
    const quiz = new Quiz({ title, questions, createdBy: req.userId });
    await quiz.save();

    res.status(201).json({ message: `${title} Quiz created successfully`, quiz });
  } catch (err) {
    res.status(500).json({ message: "Quiz is not created. Please try again.", error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'username');
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quizzes', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz', error: err.message });
  }
});

module.exports = router;
