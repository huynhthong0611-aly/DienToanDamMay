const SanPham = require("../models/SanPham");
const BienThe = require("../models/BienTheSanPham"); // Đảm bảo đúng đường dẫn

exports.getCart = async (req, res) => {
    try {
        // Đảm bảo cart luôn là một mảng
        const cart = req.session.cart || [];
        
        let total = 0;
        // Tính toán lại giá trị ngay tại thời điểm gọi để đảm bảo chính xác
        const cart_items = cart.map(item => {
            const price = Number(item.gia || 0);
            const subtotal = price * (item.so_luong || 0);
            total += subtotal;
            return { ...item, subtotal };
        });

        res.render("giohang", { cart_items, total });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

exports.addToCart = async (req, res) => {
    try {
        if (!req.session.userId) return res.send("<script>alert('Vui lòng đăng nhập!'); window.location.href='/login';</script>");

        const { product_id, quantity, size, product_price, product_name, product_image } = req.body;
        const pId = Number(product_id);
        const qty = Number(quantity) || 1;

        const allVariants = await BienThe.find({ san_pham_id: pId });
        const variant = allVariants.find(v => String(v.kich_co || "").trim() === String(size || "").trim());

        if (!variant) return res.send("Không tìm thấy kích cỡ này.");

        if (!req.session.cart) req.session.cart = [];
        let cart = req.session.cart;

        let index = cart.findIndex(item => String(item.id_bien_the) === String(variant._id));

        if (index !== -1) {
            cart[index].so_luong += qty;
        } else {
            cart.push({
                id_san_pham: pId,
                id_bien_the: variant._id.toString(),
                ten_sp: product_name,
                hinh_anh: product_image,
                kich_co: size,
                so_luong: qty,
                gia: Number(product_price)
            });
        }
        req.session.cart = cart;
        res.redirect("/giohang");
    } catch (err) {
        res.status(500).send("Lỗi server");
    }
};
// ================= UPDATE CART =================
exports.updateCart = (req, res) => {
    const { cart_id, action } = req.body;
    let cart = req.session.cart || [];
    let item = cart.find(i => String(i.id_bien_the) === String(cart_id));

    if (item) {
        if (action === "increase") item.so_luong += 1;
        if (action === "decrease") {
            item.so_luong -= 1;
            if (item.so_luong <= 0) cart = cart.filter(i => String(i.id_bien_the) !== String(cart_id));
        }
    }
    req.session.cart = cart;
    res.redirect("/giohang");
};

// ================= DELETE ITEM =================
exports.deleteItem = (req, res) => {
    const { cart_id } = req.body;
    req.session.cart = (req.session.cart || []).filter(i => String(i.id_bien_the) !== String(cart_id));
    res.redirect("/giohang");
};

// ================= CLEAR CART =================
exports.clearCart = (req, res) => {
    req.session.cart = [];
    res.redirect("/giohang");
};