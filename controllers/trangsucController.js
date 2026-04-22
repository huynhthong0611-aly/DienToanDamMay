const SanPham = require("../models/SanPham");

exports.getSanPhamDanhMuc14 = async (req, res) => {
    try {
        const results = await SanPham.find(
            { danh_muc_id: 14 },
            {
                id: 1,
                ten_sp: 1,
                gia: 1,
                hinh_anh: 1,
                danh_muc_id: 1
            }
        );

        console.log("Sản phẩm danh mục 14:", results);

        res.render("trangsuc", {
            products: results
        });

    } catch (error) {
        console.error("Lỗi MongoDB:", error);
        res.status(500).send("Server error");
    }
};