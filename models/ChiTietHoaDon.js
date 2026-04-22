const mongoose = require("mongoose");

const chiTietHoaDonSchema = new mongoose.Schema({
    IdHoaDon: {
        type: Number,
        required: true
    },

    IdSanPham: {
        type: Number,
        required: true
    },

    TenSanPham: String,
    KichThuoc: String,

    SoLuong: Number,
    DonGia: Number,
    ThanhTien: Number,

    HinhAnh: String
}, {
    timestamps: true
});

module.exports = mongoose.model("ChiTietHoaDon", chiTietHoaDonSchema);