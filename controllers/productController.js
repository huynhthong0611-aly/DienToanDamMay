const mongoose = require("mongoose");

const SanPham = require("../models/SanPham");
const BienTheSanPham = require("../models/BienTheSanPham");
const ThuongHieu = require("../models/ThuongHieu");

exports.getProductDetail = async (req, res) => {
    try {
        const product_id = req.params.id;

        // ================== PRODUCT ==================
        const product = await SanPham.findById(product_id).lean();
        if (!product) return res.send("Sản phẩm không tồn tại");

        // ================== BIẾN THỂ ==================
        const stockRows = await BienTheSanPham.find({
            san_pham_id: product.id || product.san_pham_id
        }).lean() || [];

        let stock_data = {};
        let sizes = [];

        stockRows.forEach(r => {
            const size = String(r.kich_co).trim();
            stock_data[size] = Number(r.so_luong);
            sizes.push(size);
        });

        sizes = [...new Set(sizes)].sort((a, b) => Number(a) - Number(b));

        // danh_muc_id giờ là ObjectId, không cần convert

        // ================== THƯƠNG HIỆU ==================
        let thuong_hieu_name = "Không có thông tin";

        if (product.thuong_hieu_id) {
            let thuong_hieu = null;

            if (mongoose.Types.ObjectId.isValid(product.thuong_hieu_id)) {
                thuong_hieu = await ThuongHieu.findById(product.thuong_hieu_id).lean();
            }

            if (!thuong_hieu) {
                thuong_hieu = await ThuongHieu.findOne({
                    ma_thuong_hieu: Number(product.thuong_hieu_id)
                }).lean();
            }

            if (thuong_hieu) {
                thuong_hieu_name = thuong_hieu.ten_thuong_hieu;
            }
        }

        // ================== LIÊN QUAN ==================
        const lienquan = await SanPham.find({
            danh_muc_id: product.danh_muc_id || 0,
            _id: { $ne: product._id }
        }).limit(4).lean();

        // ================== RENDER ==================
        return res.render("chitiet", {
            product,
            sizes,
            stock_data,
            result_lienquan: lienquan,
            thuong_hieu_name,
            is_logged_in: !!req.session.user,
            returnUrl: req.originalUrl   // ✅ QUAN TRỌNG
        });

    } catch (err) {
        console.log("DETAIL ERROR:", err);
        res.status(500).send("Lỗi server");
    }
};