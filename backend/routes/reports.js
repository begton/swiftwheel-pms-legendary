const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET Customer-Promotion Report
router.get('/customer-promotions', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vw_Customer_Promotion_Report');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET Dashboard Stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [[{ totalVehicles }]] = await db.query('SELECT COUNT(*) AS totalVehicles FROM Vehicle');
    const [[{ totalCustomers }]] = await db.query('SELECT COUNT(*) AS totalCustomers FROM Customer');
    const [[{ totalPromotions }]] = await db.query('SELECT COUNT(*) AS totalPromotions FROM Promotion');
    const [[{ activePromotions }]] = await db.query("SELECT COUNT(*) AS activePromotions FROM Promotion WHERE Status='Active'");
    const [[{ activeCustomers }]] = await db.query("SELECT COUNT(*) AS activeCustomers FROM Customer WHERE Status='Active'");
    const [[{ availableVehicles }]] = await db.query("SELECT COUNT(*) AS availableVehicles FROM Vehicle WHERE Status='Available'");
    res.json({ totalVehicles, totalCustomers, totalPromotions, activePromotions, activeCustomers, availableVehicles });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
