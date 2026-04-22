const HoaDon = require('../models/HoaDon');
const CTHD = require('../models/ChiTietHoaDon');
const BienThe = require('../models/BienTheSanPham');

exports.lichSuMuaHang = async (req, res) => {
    try {
        // 🔐 CHECK LOGIN
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const userId = req.session.userId;

        // 📦 LẤY HÓA ĐƠN
        const ordersRaw = await HoaDon.find({
            id_khachhang: userId
        }).sort({ NgayDat: -1 });

        // 🚀 XỬ LÝ SONG SONG
        const orders = await Promise.all(
            ordersRaw.map(async (h) => {

                const items = await CTHD.find({ IdHoaDon: h.IdHoaDon });

                const itemList = await Promise.all(
                    items.map(async (c) => {

                        const variant = await BienThe.findOne({
                            san_pham_id: c.IdSanPham,
                            kich_co: c.KichThuoc
                        });

                        return {
                            Ten: c.TenSanPham,
                            SoLuong: c.SoLuong,
                            DonGia: c.DonGia,
                            HinhAnh: c.HinhAnh,
                            KichThuoc: c.KichThuoc,
                            SoLuongKho: variant ? variant.so_luong : 0
                        };
                    })
                );

                return {
                    IdHoaDon: h.IdHoaDon,
                    DiaChi: h.DiaChi,
                    TongTien: h.TongTien,
                    NgayDat: h.NgayDat,
                    TrangThai: h.TrangThai ? h.TrangThai.trim() : "Chờ xử lý",
                    items: itemList
                };
            })
        );

        res.render('lichsu', { orders });

    } catch (err) {
        console.error("❌ Lỗi lịch sử:", err);
        res.render('lichsu', { orders: [] });
    }
};