const mongoose = require("mongoose");

const sanPhamSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },

    ten_sp: { type: String, required: true },
    ma_sp: { type: String, required: true },

    gia: { type: Number, required: true },
    gia_khuyen_mai: { type: Number, default: 0 },

    chat_lieu: String,
    da_chinh: String,
    trong_luong: Number,
    mo_ta: String,
    hinh_anh: String,

    danh_muc_id: Number,
    thuong_hieu_id: Number,

    trang_thai: { type: Number, default: 0 },

    ngay_tao: {
        type: String,
        default: () => new Date().toLocaleString("vi-VN")
    }
}, {
    versionKey: false,
    collection: "sanpham"
});

module.exports = mongoose.model("SanPham", sanPhamSchema);