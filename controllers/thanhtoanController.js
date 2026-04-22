const SanPham = require("../models/SanPham");
const BienThe = require("../models/BienTheSanPham");
const HoaDon = require("../models/HoaDon");
const ChiTietHoaDon = require("../models/ChiTietHoaDon");
const mongoose = require("mongoose");

// ================= HIỂN THỊ CHECKOUT (GIỎ HÀNG / BUY NOW) =================
exports.checkoutPage = async (req, res) => {
    try {
        let items = [];
        let total = 0;

        if (req.session.checkout_items?.length > 0) {
            items = req.session.checkout_items;
            total = req.session.checkout_total || 0;
        } else {
            const cart = req.session.cart || [];
            if (!cart.length) return res.redirect("/giohang");

            items = cart.map(item => {
                const subtotal = Number(item.gia) * Number(item.so_luong);

                total += subtotal;

                return {
                    product_id: Number(item.id_san_pham), // ✔ FIX NUMBER
                    product_name: item.ten_sp,
                    product_price: Number(item.gia),
                    product_image: item.hinh_anh,
                    size: item.kich_co || "",
                    quantity: Number(item.so_luong),
                    subtotal
                };
            });
        }

        const phi_ship = total >= 1000000 ? 0 : 30000;

        return res.render("checkout", {
            items,
            tong_thanh_toan: total + phi_ship
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// ================= MUA NGAY =================
exports.buyNow = async (req, res) => {
    try {
        const { id, size, qty } = req.query;

        if (!id) return res.redirect("/");

        const product = await SanPham.findOne({ id: Number(id) });
        if (!product) return res.redirect("/");

        const quantity = Number(qty) || 1;

        const item = {
            product_id: product.id, // ✔ NUMBER
            product_name: product.ten_sp,
            product_price: product.gia,
            product_image: product.hinh_anh,
            size: size || "",
            quantity: quantity,
            subtotal: product.gia * quantity
        };

        req.session.checkout_items = [item];
        req.session.checkout_total = item.subtotal;

        const phi_ship = item.subtotal >= 1000000 ? 0 : 30000;

        return res.render("checkout", {
            items: [item],
            tong_thanh_toan: item.subtotal + phi_ship
        });

    } catch (err) {
        console.error("BUY NOW ERROR:", err);
        return res.redirect("/");
    }
};

// ================= CHECKOUT =================
exports.confirmCheckout = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { hoten, email, sodienthoai, diachi } = req.body;

        const items = req.session.checkout_items || [];
        const total = req.session.checkout_total || 0;

        if (!items.length) {
            await session.abortTransaction();
            return res.redirect("/giohang");
        }

        // ===== SHIP =====
        const phi_ship = total >= 1000000 ? 0 : 30000;
        const tongTien = total + phi_ship;

        // ===== AUTO ID =====
        const last = await HoaDon.findOne()
            .sort({ IdHoaDon: -1 })
            .session(session);

        const newId = last ? last.IdHoaDon + 1 : 1;

        // ===== CREATE ORDER =====
        await HoaDon.create([{
            IdHoaDon: newId,
            id_khachhang: req.session.userId,
            HoTenKhachHang: hoten,
            Email: email,
            SoDienThoai: sodienthoai,
            DiaChi: diachi,
            TongTien: tongTien,
            PhuongThucThanhToan: "COD",
            TrangThai: "Chờ xử lý",
            NgayLap: new Date()
        }], { session });

        // ===== ORDER DETAILS =====
        for (let item of items) {

            const productId = Number(item.product_id); // 🔥 FIX QUAN TRỌNG

            await ChiTietHoaDon.create([{
                IdHoaDon: newId,
                IdSanPham: productId,
                TenSanPham: item.product_name,
                KichThuoc: item.size,
                SoLuong: item.quantity,
                DonGia: item.product_price,
                ThanhTien: item.subtotal,
                HinhAnh: item.product_image
            }], { session });

            await BienThe.updateOne(
                {
                    san_pham_id: productId,
                    kich_co: item.size
                },
                {
                    $inc: { so_luong: -item.quantity }
                },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        req.session.cart = [];
        req.session.checkout_items = [];
        req.session.checkout_total = 0;

        return res.send(`
            <script>
                alert('Đặt hàng thành công!');
                window.location.href='/lichsu';
            </script>
        `);

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error(err);

        return res.send(`
            <script>
                alert('Thanh toán thất bại: ${err.message}');
                window.location.href='/giohang';
            </script>
        `);
    }
};