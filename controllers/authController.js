const bcrypt = require('bcrypt');
const User = require('../models/User');

// ================== LOGIN ==================
exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        email = email.trim().toLowerCase();
        password = password.trim();

        const user = await User.findOne({ Email: email });

        if (!user) {
            return res.render('login', {
                error: 'Sai email hoặc mật khẩu',
                lastEmail: email
            });
        }

        let isMatch = false;

        // ===== CASE 1: NODE BCRYPT =====
        if (user.MatKhau.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.MatKhau);
        }

        // ===== CASE 2: PHP BCRYPT ($2y$) =====
        else if (user.MatKhau.startsWith('$2y$')) {
            const fixedHash = user.MatKhau.replace('$2y$', '$2a$');
            isMatch = await bcrypt.compare(password, fixedHash);

            if (isMatch) {
                const newHash = await bcrypt.hash(password, 10);
                user.MatKhau = newHash;
                await user.save();
            }
        }

        // ===== CASE 3: plain text (DB cũ) =====
        else {
            isMatch = (password === user.MatKhau);
        }

        if (!isMatch) {
            return res.render('login', {
                error: 'Sai email hoặc mật khẩu',
                lastEmail: email
            });
        }

        // ================== SESSION ==================
        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            HoTen: user.HoTen,
            Email: user.Email,
            VaiTro: user.VaiTro,
            anh_dai_dien: user.anh_dai_dien
        };

        req.session.lastEmail = user.Email;

        // ================== CHECK QUYỀN & REDIRECT =================
        // Nếu là Admin → redirect sang trang admin
        if (user.VaiTro === 'Admin') {
            return res.redirect('/admin');
        }
        
        // Nếu là User hoặc Khách hàng → redirect sang home
        return res.redirect('/');

    } catch (err) {
        console.log(err);
        return res.render('login', {
            error: 'Lỗi server: ' + err.message
        });
    }
};

// ================== REGISTER ==================
exports.register = async (req, res) => {
    try {
        let { HoTen, Email, MatKhau } = req.body;

        // ⭐ chống undefined
        HoTen = HoTen ? HoTen.trim() : "";
        Email = Email ? Email.trim().toLowerCase() : "";
        MatKhau = MatKhau ? MatKhau.trim() : "";

        // check thiếu dữ liệu
        if (!HoTen || !Email || !MatKhau) {
            return res.render('dangky', {
                error: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        const exist = await User.findOne({ Email });

        if (exist) {
            return res.render('dangky', {
                error: 'Email đã tồn tại'
            });
        }

        const hash = await bcrypt.hash(MatKhau, 10);

        const user = new User({
            HoTen,
            Email,
            MatKhau: hash
        });

        await user.save();

        return res.redirect('/login');

    } catch (err) {
        console.log(err);
        return res.render('dangky', {
            error: 'Lỗi server: ' + err.message
        });
    }
};
// ================== LOGOUT ==================
exports.dangXuat = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');
        return res.redirect('/');
    });
};