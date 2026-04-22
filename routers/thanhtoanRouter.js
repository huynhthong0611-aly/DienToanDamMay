const express = require("express");
const router = express.Router();

const thanhtoanController = require("../controllers/thanhtoanController");

router.get("/thanhtoan-ngay", thanhtoanController.buyNow);
router.get("/thanhtoan", thanhtoanController.checkoutPage);
router.post("/thanhtoan/confirm", thanhtoanController.confirmCheckout);
module.exports = router;