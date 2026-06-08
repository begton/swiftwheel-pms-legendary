const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET all customers
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Customer';
    let params = [];
    if (search) {
      query += ' WHERE FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ? OR PhoneNumber LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    query += ' ORDER BY CreatedAt DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single customer
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Customer WHERE CustomerID = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Customer not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create customer
router.post('/', requireAuth, async (req, res) => {
  try {
    const { FirstName, LastName, Email, PhoneNumber, Status } = req.body;
    if (!FirstName || !LastName || !Email || !PhoneNumber)
      return res.status(400).json({ message: 'All required fields must be provided.' });

    const [result] = await db.query(
      'INSERT INTO Customer (FirstName, LastName, Email, PhoneNumber, Status, UserID) VALUES (?, ?, ?, ?, ?, ?)',
      [FirstName, LastName, Email, PhoneNumber, Status || 'Active', req.session.user.UserID]
    );
    res.status(201).json({ message: 'Customer created successfully.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// PUT update customer
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { FirstName, LastName, Email, PhoneNumber, Status } = req.body;
    const [result] = await db.query(
      'UPDATE Customer SET FirstName=?, LastName=?, Email=?, PhoneNumber=?, Status=? WHERE CustomerID=?',
      [FirstName, LastName, Email, PhoneNumber, Status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Customer not found.' });
    res.json({ message: 'Customer updated successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE customer
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Customer WHERE CustomerID = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Customer not found.' });
    res.json({ message: 'Customer deleted successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
