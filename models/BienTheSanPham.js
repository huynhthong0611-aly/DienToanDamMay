const mongoose = require('mongoose');

// Định nghĩa Schema
const bientheSanphamSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  san_pham_id: { type: Number, ref: 'Sanpham', required: true, index: true },
  kich_co: { type: String },
  so_luong: { type: Number, required: true, default: 0 }
}, {
  collection: 'bien_the_san_pham'
});

// THAY ĐỔI Ở ĐÂY:
// Kiểm tra xem model đã được tạo chưa, nếu rồi thì lấy ra, chưa thì mới tạo mới
const BientheSanpham = mongoose.models.BientheSanpham || mongoose.model('BientheSanpham', bientheSanphamSchema);

module.exports = BientheSanpham;