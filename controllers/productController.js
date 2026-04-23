const mongoose = require("mongoose");

const SanPham = require("../models/SanPham");
const BienTheSanPham = require("../models/BienTheSanPham");
const ThuongHieu = require("../models/ThuongHieu");

exports.getProductDetail = async (req, res) => {
    try {
        const product_id = req.params.id;
        let product = null;

        // ================== PRODUCT LOOKUP ==================
        // Thử tìm bằng _id (ObjectId)
        if (mongoose.Types.ObjectId.isValid(product_id)) {
            product = await SanPham.findById(product_id).lean();
        }

        // Nếu không tìm thấy hoặc ID không phải ObjectId, thử tìm bằng id (Number)
        if (!product) {
            const numericId = Number(product_id);
            if (!isNaN(numericId)) {
                product = await SanPham.findOne({ id: numericId }).lean();
            }
        }

        if (!product) return res.send("Sản phẩm không tồn tại");

        // ================== BIẾN THỂ ==================
        const productIdForVariants = product.id || product.san_pham_id;
        const stockRows = await BienTheSanPham.find({
            san_pham_id: productIdForVariants
        }).lean() || [];

        let stock_data = {};
        let sizes = [];

        stockRows.forEach(r => {
            if (r.kich_co !== null && r.kich_co !== undefined) {
                const size = String(r.kich_co).trim();
                stock_data[size] = Number(r.so_luong);
                sizes.push(size);
            }
        });

        sizes = [...new Set(sizes)].sort((a, b) => {
            const numA = Number(a);
            const numB = Number(b);
            if (isNaN(numA) || isNaN(numB)) return String(a).localeCompare(String(b));
            return numA - numB;
        });

        // ================== THƯƠNG HIỆU ==================
        let thuong_hieu_name = "Không có thông tin";

        if (product.thuong_hieu_id) {
            let thuong_hieu = null;

            if (mongoose.Types.ObjectId.isValid(product.thuong_hieu_id)) {
                thuong_hieu = await ThuongHieu.findById(product.thuong_hieu_id).lean();
            }

            if (!thuong_hieu) {
                // Sửa: Dùng field 'id' thay vì 'ma_thuong_hieu'
                const thId = Number(product.thuong_hieu_id);
                if (!isNaN(thId)) {
                    thuong_hieu = await ThuongHieu.findOne({ id: thId }).lean();
                }
            }

            if (thuong_hieu) {
                thuong_hieu_name = thuong_hieu.ten_thuong_hieu;
            }
        }

        // ================== LIÊN QUAN ==================
        let lienquan = [];
        if (product.danh_muc_id) {
            lienquan = await SanPham.find({
                danh_muc_id: product.danh_muc_id,
                _id: { $ne: product._id }
            }).limit(4).lean();
        }

        // ================== RENDER ==================
        return res.render("chitiet", {
            product,
            sizes,
            stock_data,
            result_lienquan: lienquan,
            thuong_hieu_name,
            is_logged_in: !!req.session.user,
            returnUrl: req.originalUrl
        });

    } catch (err) {
        console.error("DETAIL ERROR:", err);
        res.status(500).send("Lỗi server: " + err.message);
    }
};