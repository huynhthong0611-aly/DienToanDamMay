const mongoose = require("mongoose");

const thuongHieuSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    ten_thuong_hieu: {
        type: String,
        required: true
    }
}, {
    collection: "thuong_hieu",
    timestamps: false
});

module.exports = mongoose.model("ThuongHieu", thuongHieuSchema);