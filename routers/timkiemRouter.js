const express = require("express");
const router = express.Router();

const timkiemController = require("../controllers/timkiemController");

// 🔍 GET /timkiem?keyword=...
router.get("/timkiem", timkiemController.search);

module.exports = router;