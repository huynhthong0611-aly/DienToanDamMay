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
            // Đến từ "Mua ngay" - đã có sẵn
            items = req.session.checkout_items;
            total = req.session.checkout_total || 0;
        } else {
            // Đến từ giỏ hàng
            const cart = req.session.cart || [];
            if (!cart.length) return res.redirect("/giohang");

            items = cart.map(item => {
                const subtotal = Number(item.gia) * Number(item.so_luong);
                total += subtotal;
                return {
                    product_id: Number(item.id_san_pham),
                    variant_id: item.id_bien_the, // Lưu ID biến thể để trừ kho chính xác
                    product_name: item.ten_sp,
                    product_price: Number(item.gia),
                    product_image: item.hinh_anh,
                    size: item.kich_co || "",
                    quantity: Number(item.so_luong),
                    subtotal
                };
            });

            // ✅ LƯU VÀO SESSION để confirmCheckout đọc được
            req.session.checkout_items = items;
            req.session.checkout_total = total;
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

        // Tìm biến thể tương ứng với size
        const allVariants = await BienThe.find({ san_pham_id: product.id });
        const variant = allVariants.find(v => String(v.kich_co).trim() === String(size || "").trim());

        const quantity = Number(qty) || 1;

        const item = {
            product_id: product.id,
            variant_id: variant ? variant._id.toString() : null, // Lưu ID biến thể
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
    let newId = null;

    try {
        const { hoten, email, sodienthoai, diachi } = req.body;

        const items = req.session.checkout_items || [];
        const total = req.session.checkout_total || 0;

        if (!items.length) {
            return res.redirect("/giohang");
        }

        // ===== SHIP =====
        const phi_ship = total >= 1000000 ? 0 : 30000;
        const tongTien = total + phi_ship;

        // ===== AUTO ID =====
        const last = await HoaDon.findOne().sort({ IdHoaDon: -1 });
        newId = last ? last.IdHoaDon + 1 : 1;

        // ===== CREATE ORDER =====
        await HoaDon.create({
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
        });

        // ===== ORDER DETAILS =====
        for (let item of items) {
            const productId = Number(item.product_id);

            await ChiTietHoaDon.create({
                IdHoaDon: newId,
                IdSanPham: productId,
                TenSanPham: item.product_name,
                KichThuoc: item.size,
                SoLuong: item.quantity,
                DonGia: item.product_price,
                ThanhTien: item.subtotal,
                HinhAnh: item.product_image
            });

            // Trừ kho (Sử dụng variant_id nếu có, nếu không thì fallback về tìm theo size)
            try {
                let filter = {};
                if (item.variant_id) {
                    filter = { _id: item.variant_id };
                } else {
                    const sizeVal = item.size;
                    const sizeNum = Number(sizeVal);
                    const matchValues = [sizeVal];
                    if (!isNaN(sizeNum)) matchValues.push(sizeNum);
                    filter = { 
                        san_pham_id: productId, 
                        kich_co: { $in: matchValues }
                    };
                }

                const result = await BienThe.updateOne(
                    filter,
                    { $inc: { so_luong: -item.quantity } }
                );

                if (result.matchedCount === 0) {
                    console.warn(`Không tìm thấy biến thể để trừ kho: SP ${productId}, Size ${item.size}, VariantID ${item.variant_id}`);
                } else {
                    console.log(`Đã trừ kho thành công: SP ${productId}, Size ${item.size}, SL -${item.quantity}`);
                }
            } catch (khoErr) {
                console.error('Lỗi khi cập nhật kho:', khoErr.message);
            }
        }

        // ===== CLEAR SESSION =====
        req.session.cart = [];
        req.session.checkout_items = [];
        req.session.checkout_total = 0;

        return res.send(`
            <script>
                alert('Đặt hàng thành công! Mã đơn hàng: #${newId}');
                window.location.href='/lichsu';
            </script>
        `);

    } catch (err) {
        console.error('CHECKOUT ERROR:', err);

        // Cleanup thủ công: nếu đã tạo HoaDon nhưng ChiTietHoaDon lỗi → xóa đơn hàng
        if (newId) {
            try {
                await HoaDon.deleteOne({ IdHoaDon: newId });
                await ChiTietHoaDon.deleteMany({ IdHoaDon: newId });
                console.log('Đã cleanup đơn hàng lỗi #' + newId);
            } catch (cleanupErr) {
                console.error('Cleanup thất bại:', cleanupErr.message);
            }
        }

        return res.send(`
            <script>
                alert('Thanh toán thất bại: ${err.message}');
                window.location.href='/giohang';
            </script>
        `);
    }
};