const express = require("express");
const router = express.Router();
const sanphamController = require("../controllers/sanphamController");

router.get("/sanpham", sanphamController.getSanPham);

module.exports = router;