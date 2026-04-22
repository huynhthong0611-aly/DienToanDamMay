const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// GET chi tiết sản phẩm
router.get("/chitiet/:id", productController.getProductDetail);
module.exports = router;