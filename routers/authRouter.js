const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ================== LOGIN ==================
router.get("/login", (req, res) => {
    res.render("login", {
        lastEmail: req.session.lastEmail || ""
    });
});

router.post("/login", authController.login);

// ================== REGISTER ==================
router.get("/dangky", (req, res) => {
    res.render("dangky", {
        error: null
    });
});

router.post("/dangky", authController.register);

// ================== LOGOUT ==================
router.get("/dangxuat", authController.dangXuat);

module.exports = router;