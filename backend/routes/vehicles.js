const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET all vehicles
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Vehicle';
    let params = [];
    if (search) {
      query += ' WHERE Brand LIKE ? OR Model LIKE ? OR Plate_Number LIKE ? OR Vehicle_Type LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    query += ' ORDER BY CreatedAt DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single vehicle
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Vehicle WHERE Plate_Number = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create vehicle
router.post('/', requireAuth, async (req, res) => {
  try {
    const { Plate_Number, Brand, Model, Year, Vehicle_Type, Purchase_Price, Status } = req.body;
    if (!Plate_Number || !Brand || !Model || !Year || !Vehicle_Type || !Purchase_Price)
      return res.status(400).json({ message: 'All required fields must be provided.' });

    await db.query(
      'INSERT INTO Vehicle (Plate_Number, Brand, Model, Year, Vehicle_Type, Purchase_Price, Status, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Plate_Number, Brand, Model, Year, Vehicle_Type, Purchase_Price, Status || 'Available', req.session.user.UserID]
    );
    res.status(201).json({ message: 'Vehicle created successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Plate number already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// PUT update vehicle
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { Brand, Model, Year, Vehicle_Type, Purchase_Price, Status } = req.body;
    const [result] = await db.query(
      'UPDATE Vehicle SET Brand=?, Model=?, Year=?, Vehicle_Type=?, Purchase_Price=?, Status=? WHERE Plate_Number=?',
      [Brand, Model, Year, Vehicle_Type, Purchase_Price, Status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle updated successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE vehicle
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Vehicle WHERE Plate_Number = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Vehicle not found.' });
    res.json({ message: 'Vehicle deleted successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
