const express = require("express");
const router = express.Router();

// ================== POLICY PAGES ==================

router.get("/giaohang", (req, res) => {
    res.render("giaohang");
});

router.get("/baohanh", (req, res) => {
    res.render("baohanh");
});

router.get("/baomat", (req, res) => {
    res.render("baomat");
});

router.get("/doitra", (req, res) => {
    res.render("doitra");
});
router.get("/thongtin", (req, res) => {
    res.render("thongtin");
});
router.get('/lienhe', (req, res) => {
    res.render('lienhe', {
        title: 'Liên hệ - Luxury Jewelry'
    });
});
module.exports = router;