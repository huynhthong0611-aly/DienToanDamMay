const mongoose = require("mongoose");

const hoaDonSchema = new mongoose.Schema({
    IdHoaDon: {
        type: Number,
        required: true,
        unique: true
    },

    NgayLap: { type: Date, default: Date.now },

    TongTien: { type: Number, required: true },

    id_khachhang: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    HoTenKhachHang: String,
    Email: String,
    DiaChi: String,
    SoDienThoai: Number,

    PhuongThucThanhToan: { type: String, default: "COD" },
    TrangThai: { type: String, default: "Chờ xử lý" },
    ngay_giao: { type: Date, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model("HoaDon", hoaDonSchema);