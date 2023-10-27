const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Route for user registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Validate and sanitize user inputs
    [
      body('username').isString().isLength({ min: 1 }).trim(),
      body('email').isEmail().normalizeEmail(),
      body('password').isString().isLength({ min: 6 }).trim(),
    ].forEach((validation) => validation(req));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    res.json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Route for user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate and sanitize user inputs
    [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 6 }).trim()].forEach(
      (validation) => validation(req)
    );

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Route for user logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Implement token invalidation (if needed)
    res.json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
