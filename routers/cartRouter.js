const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Giả sử ở app.js bạn đã dùng: app.use("/giohang", cartRouter);

// Các route bên dưới sẽ bắt đầu từ sau chữ /giohang
router.post("/add", cartController.addToCart);
router.get("/", cartController.getCart);       
router.post("/update", cartController.updateCart); 
router.post("/delete", cartController.deleteItem); 
router.get("/clear", cartController.clearCart);    

module.exports = router;