const express = require("express");
const router = express.Router();

const trangsucController = require("../controllers/trangsucController");

// Route danh mục 14 (trang sức)
router.get("/trangsuc", trangsucController.getSanPhamDanhMuc14);

module.exports = router;