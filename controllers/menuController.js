const User = require('./models/User'); // sửa path nếu cần

app.use(async (req, res, next) => {

    let user = null;
    let avatar_src = '/image/default.jpg';

    const userId = req.session.userId || req.session.id_user;

    if (userId) {
        user = await User.findById(userId);

        if (user?.anh_dai_dien) {

            const img = user.anh_dai_dien;

            if (img.startsWith('http')) {
                avatar_src = img;

            } else if (img.startsWith('/image/')) {
                avatar_src = img;

            } else {
                avatar_src = '/image/' + img;
            }
        }
    }

    // ================= CART =================
    const cart = req.session.cart || [];

    const unique_product_count = new Set(
        cart.map(item => item.productId?.toString())
    ).size;

    // ================= PUSH =================
    res.locals.user = user;
    res.locals.avatar_src = avatar_src;
    res.locals.unique_product_count = unique_product_count;

    next();
});