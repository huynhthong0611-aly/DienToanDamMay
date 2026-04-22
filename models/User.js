// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    anh_dai_dien: { type: String, default: 'default.jpg' },
    HoTen: { type: String, required: true },
    Email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    MatKhau: { type: String, required: true },
    SoDienThoai: String,
    DiaChi: String,
        VaiTro: {
            type: String,
            enum: ['Admin', 'User', 'Khách hàng'],
            default: 'Khách hàng'
        },
    ngay_tao: { type: Date, default: Date.now },
    TrangThai: { type: Number, default: 1 }
}, { collection: 'nguoidungs' }); 

module.exports = mongoose.model('User', userSchema);