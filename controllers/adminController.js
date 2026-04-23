const User = require('../models/User');
const SanPham = require('../models/SanPham');
const HoaDon = require('../models/HoaDon');
const ChiTietHoaDon = require('../models/ChiTietHoaDon');
const DanhMuc = require('../models/DanhMuc');
const ThuongHieu = require('../models/ThuongHieu');
const BienThe = require('../models/BienTheSanPham');
const bcrypt = require('bcrypt');

// ================= USERS MANAGEMENT =================

// GET: Danh sách users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).lean();
        res.render("admin/users", { users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// GET: Form thêm user
exports.addUserForm = (req, res) => {
    res.render("admin/add-user");
};

// POST: Thêm user
exports.addUser = async (req, res) => {
    try {
        const { HoTen, Email, MatKhau, VaiTro, SoDienThoai, DiaChi } = req.body;

        // Kiểm tra email tồn tại
        const exist = await User.findOne({ Email });
        if (exist) {
            return res.render("admin/add-user", {
                error: "Email đã tồn tại"
            });
        }

        // Hash password
        const hash = await bcrypt.hash(MatKhau, 10);

        // Handle avatar upload
        let avatar = 'default.jpg';
        if (req.file) {
            avatar = req.file.filename; // Lưu tên file được upload
        }

        // Tạo user mới
        const newUser = new User({
            HoTen,
            Email,
            MatKhau: hash,
            VaiTro: VaiTro || 'Khách hàng',
            SoDienThoai,
            DiaChi,
            anh_dai_dien: avatar
        });

        await newUser.save();
        res.redirect('/admin/users?success=1');

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// GET: Form edit user
exports.editUserForm = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).lean();
        if (!user) return res.send("User không tồn tại");

        res.render("admin/edit-user", { user });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// POST: Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { HoTen, Email, VaiTro, SoDienThoai, DiaChi } = req.body;

        // Get current user to keep avatar if no new upload
        const currentUser = await User.findById(id);
        let avatar = currentUser.anh_dai_dien;

        // Handle avatar upload
        if (req.file) {
            avatar = req.file.filename; // Use new uploaded file
        }

        await User.updateOne(
            { _id: id },
            {
                $set: {
                    HoTen,
                    Email,
                    VaiTro,
                    SoDienThoai,
                    DiaChi,
                    anh_dai_dien: avatar
                }
            }
        );

        res.redirect('/admin/users?success=1');

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// DELETE: Xóa user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Không cho phép xóa chính mình
        if (req.session.user.id == id) {
            return res.status(400).send("Không thể xóa chính mình");
        }

        await User.deleteOne({ _id: id });
        res.redirect('/admin/users?success=1');

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// ================= PRODUCTS MANAGEMENT =================

// GET: Danh sách sản phẩm
exports.getProducts = async (req, res) => {
    try {
        const products = await SanPham.find({}).sort({ _id: -1 }).limit(50).lean();
        res.render("admin/products", {
            products,
            success: req.query.success
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// GET: Form thêm sản phẩm
exports.addProductForm = (req, res) => {
    res.render("admin/add-product");
};

// POST: Thêm sản phẩm
exports.addProduct = async (req, res) => {
    try {
        const { id, ten_sp, ma_sp, gia, gia_khuyen_mai, chat_lieu, da_chinh, trong_luong, mo_ta, danh_muc_id, thuong_hieu_id } = req.body;

        // Kiểm tra ID tồn tại
        const exist = await SanPham.findOne({ id: Number(id) });
        if (exist) {
            return res.render("admin/add-product", {
                error: "ID sản phẩm đã tồn tại"
            });
        }

        const newProduct = new SanPham({
            id: Number(id),
            ten_sp,
            ma_sp,
            gia: Number(gia),
            gia_khuyen_mai: Number(gia_khuyen_mai) || 0,
            chat_lieu,
            da_chinh,
            trong_luong: Number(trong_luong),
            mo_ta,
            danh_muc_id: Number(danh_muc_id),
            thuong_hieu_id: Number(thuong_hieu_id),
            trang_thai: Number(req.body.trang_thai) || 1
        });

        await newProduct.save();

        // Tạo biến thể tồn kho mặc định nếu chưa có để sản phẩm hiện trong quản lý tồn kho
        const existingVariant = await BienThe.findOne({ san_pham_id: Number(id) });
        if (!existingVariant) {
            const lastVariant = await BienThe.findOne().sort({ id: -1 }).lean();
            const nextVariantId = lastVariant ? lastVariant.id + 1 : 1;
            await BienThe.create({
                id: nextVariantId,
                san_pham_id: Number(id),
                kich_co: null,
                so_luong: 0
            });
        }

        res.redirect('/admin/products?success=1');

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// GET: Form edit sản phẩm
exports.editProductForm = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await SanPham.findById(id).lean();
        if (!product) return res.send("Sản phẩm không tồn tại");

        res.render("admin/edit-product", { product });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// POST: Update sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_sp, ma_sp, gia, gia_khuyen_mai, chat_lieu, da_chinh, trong_luong, mo_ta, danh_muc_id, thuong_hieu_id } = req.body;

        await SanPham.updateOne(
            { _id: id },
            {
                $set: {
                    ten_sp,
                    ma_sp,
                    gia: Number(gia),
                    gia_khuyen_mai: Number(gia_khuyen_mai),
                    chat_lieu,
                    da_chinh,
                    trong_luong: Number(trong_luong),
                    mo_ta,
                    danh_muc_id: Number(danh_muc_id),
                    thuong_hieu_id: Number(thuong_hieu_id),
                    trang_thai: Number(req.body.trang_thai)
                }
            }
        );

        res.redirect('/admin/products?success=1');

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// DELETE: Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await SanPham.deleteOne({ _id: id });
        res.redirect('/admin/products?success=1');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// ================= ORDERS MANAGEMENT =================

// GET: Danh sách đơn hàng
exports.getOrders = async (req, res) => {
    try {
        const orders = await HoaDon.find({}).sort({ NgayLap: -1 }).limit(50).lean();
        res.render("admin/orders", { orders });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// GET: Chi tiết đơn hàng
exports.getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await HoaDon.findById(id).lean();
        if (!order) return res.send("Đơn hàng không tồn tại");

        // Query bằng IdHoaDon (Number) - khớp với schema ChiTietHoaDon
        const items = await ChiTietHoaDon.find({ IdHoaDon: order.IdHoaDon }).lean();

        res.render("admin/order-detail", { order, items, query: req.query });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};


// POST: Update trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { TrangThai } = req.body;

        await HoaDon.updateOne(
            { _id: id },
            { $set: { TrangThai } }
        );

        res.redirect(`/admin/orders/${id}?success=1`);

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// DELETE: Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Xóa chi tiết đơn hàng trước
        await ChiTietHoaDon.deleteMany({ id_hoa_don: id });

        // Xóa đơn hàng
        await HoaDon.deleteOne({ _id: id });

        res.redirect('/admin/orders?success=1');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};
// ================= CATEGORIES MANAGEMENT =================

// LIST
exports.getCategories = async (req, res) => {
    try {
        const categories = await DanhMuc.find().sort({ _id: -1 }).lean();
        res.render("admin/categories", {
            user: req.session.user,
            categories
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// ADD FORM
exports.addCategoryForm = (req, res) => {
    res.render("admin/add-categories", {
        user: req.session.user,
        error: null
    });
};

// ADD ACTION
exports.addCategory = async (req, res) => {
    try {
        const { ten_danh_muc, mo_ta, trang_thai } = req.body;
        if (!ten_danh_muc) {
            return res.render("admin/add-categories", {
                user: req.session.user,
                error: "Tên danh mục không được để trống"
            });
        }
        await DanhMuc.create({
            ten_danh_muc,
            mo_ta: mo_ta || null,
            trang_thai: Number(trang_thai)
        });
        res.redirect("/admin/categories?success=add");
    } catch (err) {
        console.error(err);
        res.render("admin/add-categories", {
            user: req.session.user,
            error: "Lỗi: " + err.message
        });
    }
};

// EDIT FORM
exports.editCategoryForm = async (req, res) => {
    try {
        const category = await DanhMuc.findById(req.params.id).lean();
        if (!category) return res.send("Không tìm thấy danh mục");

        res.render("admin/edit-categories", {
            user: req.session.user,
            category,
            error: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// UPDATE
exports.updateCategory = async (req, res) => {
    try {
        const { ten_danh_muc, mo_ta, trang_thai } = req.body;
        await DanhMuc.findByIdAndUpdate(req.params.id, {
            ten_danh_muc,
            mo_ta: mo_ta || null,
            trang_thai: Number(trang_thai)
        });
        res.redirect("/admin/categories?success=update");
    } catch (err) {
        console.error(err);
        const category = await DanhMuc.findById(req.params.id).lean();
        res.render("admin/edit-categories", {
            user: req.session.user,
            category,
            error: "Lỗi: " + err.message
        });
    }
};

// DELETE
exports.deleteCategory = async (req, res) => {
    try {
        await DanhMuc.findByIdAndDelete(req.params.id);
        res.redirect("/admin/categories?success=delete");
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server khi xóa");
    }
};

// ================= INVENTORY MANAGEMENT =================

// GET: Danh sách tồn kho (nhóm theo sản phẩm)
exports.getInventory = async (req, res) => {
    try {
        const { search, filter } = req.query;

        // Lấy tất cả biến thể kèm thông tin sản phẩm
        let allVariants = await BienThe.find().lean();
        let sanphams = await SanPham.find().lean();

        // Map sản phẩm theo id để tra nhanh
        const spMap = {};
        sanphams.forEach(sp => { spMap[sp.id] = sp; });

        // Gắn tên sản phẩm vào từng biến thể
        allVariants = allVariants.map(v => ({
            ...v,
            sanpham: spMap[v.san_pham_id] || null,
            ten_sp: spMap[v.san_pham_id]?.ten_sp || 'Không xác định',
            hinh_anh: spMap[v.san_pham_id]?.hinh_anh || null
        }));

        // Filter theo trạng thái tồn kho
        if (filter === 'out') {
            allVariants = allVariants.filter(v => v.so_luong === 0);
        } else if (filter === 'low') {
            allVariants = allVariants.filter(v => v.so_luong > 0 && v.so_luong <= 5);
        } else if (filter === 'ok') {
            allVariants = allVariants.filter(v => v.so_luong > 5);
        }

        // Tìm kiếm theo tên
        if (search) {
            const q = search.toLowerCase();
            allVariants = allVariants.filter(v => {
                const tenMatch = v.ten_sp.toLowerCase().includes(q);
                // Fix lỗi toLowerCase() nếu kich_co là số hoặc undefined
                const kichCoStr = v.kich_co ? String(v.kich_co).toLowerCase() : "";
                const kichCoMatch = kichCoStr.includes(q);
                return tenMatch || kichCoMatch;
            });
        }

        // Thống kê tổng quan
        const allForStats = await BienThe.find().lean();
        const stats = {
            total_variants: allForStats.length,
            total_products: new Set(allForStats.map(v => v.san_pham_id)).size,
            out_of_stock: allForStats.filter(v => v.so_luong === 0).length,
            low_stock: allForStats.filter(v => v.so_luong > 0 && v.so_luong <= 5).length,
            total_quantity: allForStats.reduce((s, v) => s + (v.so_luong || 0), 0)
        };

        res.render("admin/inventory", {
            user: req.session.user,
            variants: allVariants,
            stats,
            search: search || '',
            filter: filter || 'all'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// POST: Cập nhật số lượng tồn kho
exports.updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { so_luong } = req.body;

        if (so_luong === undefined || so_luong === '') {
            return res.redirect('/admin/inventory?error=empty');
        }

        await BienThe.findByIdAndUpdate(id, {
            so_luong: Number(so_luong)
        });

        res.redirect('/admin/inventory?success=update');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

// POST: Nhập thêm hàng (cộng số lượng)
exports.importStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { so_luong_nhap } = req.body;
        const qty = Number(so_luong_nhap);

        if (!qty || qty <= 0) {
            return res.redirect('/admin/inventory?error=invalid');
        }

        await BienThe.findByIdAndUpdate(id, {
            $inc: { so_luong: qty }
        });

        res.redirect('/admin/inventory?success=import');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};
