module.exports = function (req, res, next) {

    const user = req.session?.user || null;

    // ================= AVATAR FIX =================
    let avatar_src = '/image/default.jpg';

    if (user?.anh_dai_dien) {

        const img = user.anh_dai_dien;

        // Case 1: link internet
        if (img.startsWith('http')) {
            avatar_src = img;
        }

        else if (img.startsWith('/image/')) {
            avatar_src = img;
        }

        // Case 3: chỉ lưu tên file (vd: abc.jpg)
        else {
            avatar_src = '/image/' + img;
        }
    }

    // Sửa thành id_san_pham để khớp với Controller
    const unique_product_count = new Set(
        cart.map(item => item.id_san_pham?.toString())
    ).size;

    // ================= PUSH TO EJS =================
    res.locals.user = user;
    res.locals.avatar_src = avatar_src;
    res.locals.unique_product_count = unique_product_count;

    next();
    next();
};