const SanPham = require("../models/SanPham");

exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        if (!keyword.trim()) {
            return res.render("timkiem", {
                keyword,
                products: []
            });
        }
        const products = await SanPham.find({
            ten_sp: { $regex: keyword, $options: "i" }
        });

        res.render("timkiem", {
            keyword,
            products
        });

    } catch (err) {
        console.error(err);
        res.send("Lỗi server");
    }
};