const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET all promo-vehicle links
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pv.*, p.Title AS PromotionTitle, p.Discount_Type, p.Discount_Value,
             v.Brand, v.Model, v.Vehicle_Type, v.Status AS VehicleStatus
      FROM Promotion_Vehicle pv
      JOIN Promotion p ON p.PromotionID = pv.PromotionID
      JOIN Vehicle v ON v.Plate_Number = pv.Plate_Number
      ORDER BY pv.AssignedAt DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST assign vehicle to promotion
router.post('/', requireAuth, async (req, res) => {
  try {
    const { PromotionID, Plate_Number, Performance } = req.body;
    if (!PromotionID || !Plate_Number)
      return res.status(400).json({ message: 'PromotionID and Plate_Number required.' });

    await db.query(
      'INSERT INTO Promotion_Vehicle (PromotionID, Plate_Number, Performance) VALUES (?, ?, ?)',
      [PromotionID, Plate_Number, Performance || 'Good']
    );
    res.status(201).json({ message: 'Vehicle assigned to promotion successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Vehicle already in this promotion.' });
    res.status(500).json({ message: err.message });
  }
});

// PUT update performance
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { Performance } = req.body;
    const [result] = await db.query(
      'UPDATE Promotion_Vehicle SET Performance=? WHERE PV_ID=?',
      [Performance, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Record not found.' });
    res.json({ message: 'Performance updated.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE remove vehicle from promotion
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Promotion_Vehicle WHERE PV_ID = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Record not found.' });
    res.json({ message: 'Removed successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
