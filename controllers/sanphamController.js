const mongoose = require("mongoose");
const SanPham = require("../models/SanPham");

exports.getSanPham = async (req, res) => {
    try {
          let page = Number(req.query.page) || 1;
            if (page < 1) page = 1;

            const limit = 10;
            const skip = (page - 1) * limit;

        let filter = {};

        const { danh_muc_id, gia, chatlieu } = req.query;

        // ================= DANH MỤC =================
        if (danh_muc_id) {
            // Nếu là ObjectId string (24 ký tự hex), dùng trực tiếp
            // Nếu là số, convert thành ObjectId
            if (/^[0-9a-fA-F]{24}$/.test(danh_muc_id)) {
                filter.danh_muc_id = danh_muc_id;
            } else if (!isNaN(danh_muc_id)) {
                // Legacy: nếu là số, tìm danh mục với id cũ dạng số
                // Không dùng nữa vì danh_muc_id giờ là ObjectId
            }
        }

        // ================= CHẤT LIỆU =================
        if (chatlieu) {
            filter.chat_lieu = chatlieu;
        }

        // ================= GIÁ =================
        if (gia === "duoi1tr") {
            filter.gia = { $lt: 1000000 };
        } else if (gia === "1tr-8tr") {
            filter.gia = { $gte: 1000000, $lte: 8000000 };
        } else if (gia === "tren8tr") {
            filter.gia = { $gt: 8000000 };
        }

        // ================= DATA =================
        const total = await SanPham.countDocuments(filter);

        const products = await SanPham.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })
            .lean();

        res.render("sanpham", {
            result: products,
            page,
            total_pages: Math.ceil(total / limit),
            query: req.query
        });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).send("Lỗi server");
    }
};