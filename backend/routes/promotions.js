const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET all promotions
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Promotion';
    let params = [];
    if (search) {
      query += ' WHERE Title LIKE ? OR Discount_Type LIKE ? OR Description LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    query += ' ORDER BY CreatedAt DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single promotion
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Promotion WHERE PromotionID = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Promotion not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create promotion
router.post('/', requireAuth, async (req, res) => {
  try {
    const { Title, Description, Discount_Type, Discount_Value, Start_Date, End_Date, Status } = req.body;
    if (!Title || !Discount_Type || !Discount_Value || !Start_Date || !End_Date)
      return res.status(400).json({ message: 'All required fields must be provided.' });

    const [result] = await db.query(
      'INSERT INTO Promotion (Title, Description, Discount_Type, Discount_Value, Start_Date, End_Date, Status, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Title, Description, Discount_Type, Discount_Value, Start_Date, End_Date, Status || 'Active', req.session.user.UserID]
    );
    res.status(201).json({ message: 'Promotion created successfully.', id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update promotion
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { Title, Description, Discount_Type, Discount_Value, Start_Date, End_Date, Status } = req.body;
    const [result] = await db.query(
      'UPDATE Promotion SET Title=?, Description=?, Discount_Type=?, Discount_Value=?, Start_Date=?, End_Date=?, Status=? WHERE PromotionID=?',
      [Title, Description, Discount_Type, Discount_Value, Start_Date, End_Date, Status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Promotion not found.' });
    res.json({ message: 'Promotion updated successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE promotion
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Promotion WHERE PromotionID = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Promotion not found.' });
    res.json({ message: 'Promotion deleted successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
