const express = require("express");
const router = express.Router();

// ================== MIDDLEWARE CHECK ADMIN =================
const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.VaiTro !== 'Admin') {
        return res.redirect('/login');
    }
    next();
};

// ================== ADMIN DASHBOARD =================
router.get("/", requireAdmin, (req, res) => {
    res.render("admin/dashboard", {
        user: req.session.user
    });
});

module.exports = router;
