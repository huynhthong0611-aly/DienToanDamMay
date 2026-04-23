const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const adminController = require("../controllers/adminController");

const User = require("../models/User");
const Product = require("../models/SanPham");
const Order = require("../models/HoaDon");
const DanhMuc = require("../models/DanhMuc");

// ================= UPLOAD =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/image"));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9)
            + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ================= ADMIN CHECK =================
const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.VaiTro !== "Admin") {
        return res.redirect("/login");
    }
    next();
};

// ================= DASHBOARD =================
router.get("/", requireAdmin, async (req, res) => {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ VaiTro: { $ne: "Admin" } });

    const orders = await Order.find().sort({ createdAt: -1 });

    const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.TongTien || 0),
        0
    );

    res.render("admin/dashboard", {
        user: req.session.user,
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders: orders.slice(0, 5)
    });
});

// ================= USERS =================
router.get("/users", requireAdmin, adminController.getUsers);
router.get("/users/add", requireAdmin, adminController.addUserForm);
router.post("/users/add", requireAdmin, upload.single("anh_dai_dien"), adminController.addUser);
router.get("/users/edit/:id", requireAdmin, adminController.editUserForm);
router.post("/users/edit/:id", requireAdmin, upload.single("anh_dai_dien"), adminController.updateUser);
router.get("/users/delete/:id", requireAdmin, adminController.deleteUser);

// ================= PRODUCTS =================
router.get("/products", requireAdmin, adminController.getProducts);
router.get("/products/add", requireAdmin, adminController.addProductForm);
router.post("/products/add", requireAdmin, upload.single("hinh_anh"), adminController.addProduct);
router.get("/products/edit/:id", requireAdmin, adminController.editProductForm);
router.post("/products/edit/:id", requireAdmin, upload.single("hinh_anh"), adminController.updateProduct);
router.get("/products/delete/:id", requireAdmin, adminController.deleteProduct);

// ================= ORDERS =================
router.get("/orders", requireAdmin, adminController.getOrders);
router.get("/orders/delete/:id", requireAdmin, adminController.deleteOrder);  // PHẢI trước :id
router.get("/orders/:id", requireAdmin, adminController.getOrderDetail);
router.post("/orders/:id/status", requireAdmin, adminController.updateOrderStatus);

// ================= CATEGORIES =================
router.get("/categories", requireAdmin, adminController.getCategories);
router.get("/categories/add", requireAdmin, adminController.addCategoryForm);
router.post("/categories/add", requireAdmin, adminController.addCategory);
router.get("/categories/delete/:id", requireAdmin, adminController.deleteCategory); // PHẢI trước :id
router.get("/categories/edit/:id", requireAdmin, adminController.editCategoryForm);
router.post("/categories/edit/:id", requireAdmin, adminController.updateCategory);

// ================= INVENTORY =================
router.get("/inventory", requireAdmin, adminController.getInventory);
router.post("/inventory/update/:id", requireAdmin, adminController.updateInventory);
router.post("/inventory/import/:id", requireAdmin, adminController.importStock);

module.exports = router;