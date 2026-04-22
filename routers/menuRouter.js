const express = require('express');
const router = express.Router();

const menuController = require('/controllers/menuController');

// middleware chạy trước mọi route cần menu (navbar)
router.use(menuController.getMenuData);

module.exports = router;