const User = require('../models/User');

// GET
exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) return res.redirect('/login');

        const user = await User.findById(userId);

        res.render('capnhathoso', {
            user,
            success: req.query.success
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Lỗi server");
    }
};


// POST
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) return res.redirect('/login');

        const { hoten, email, soDienThoai, diaChi } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.redirect('/login');

        // ================= AVATAR =================
        let avatar = user.anh_dai_dien;

        if (req.file) {
            // ✔ GIỮ NGUYÊN TÊN FILE GỐC (2.jpg)
            avatar = req.file.originalname;
        }

        // ================= UPDATE =================
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    HoTen: hoten,
                    Email: email,
                    SoDienThoai: soDienThoai,
                    DiaChi: diaChi,
                    anh_dai_dien: avatar
                }
            }
        );

        req.session.hoten = hoten;

        return res.redirect('/capnhathoso?success=1');

    } catch (err) {
        console.log("UPDATE ERROR:", err);
        res.status(500).send("Lỗi server");
    }
};