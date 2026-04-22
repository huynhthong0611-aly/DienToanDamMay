const mongoose = require('mongoose');

const danhMucSchema = new mongoose.Schema({
    ten_danh_muc: { 
        type: String, 
        required: true 
    },

    mo_ta: { 
        type: String, 
        default: null 
    },

    trang_thai: { 
        type: Number, 
        default: 1 
    }

}, { 
    versionKey: false,
    collection: 'danhmucs'
});

module.exports = mongoose.model('DanhMuc', danhMucSchema);