const express = require('express');
const router = express.Router();

const lichsuController = require('../controllers/lichsuController');

// ================= LỊCH SỬ MUA HÀNG =================
router.get('/lichsu', lichsuController.lichSuMuaHang);

module.exports = router;