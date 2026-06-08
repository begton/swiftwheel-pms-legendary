const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required.' });

    const [rows] = await db.query('SELECT * FROM Users WHERE UserName = ?', [username]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.Password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials.' });

    req.session.user = { UserID: user.UserID, UserName: user.UserName, Role: user.Role };
    res.json({ message: 'Login successful', user: req.session.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Not authenticated.' });
  }
});

module.exports = router;
