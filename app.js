const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

// ================== BODY PARSER ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== STATIC FILE ==================
app.use(express.static(path.join(__dirname, 'public')));

// ================== SESSION ==================
app.use(session({
    secret: 'trangsuc-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 ngày
    }
}));

// ================== VIEW ENGINE ==================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ================== GLOBAL MIDDLEWARE (FIX AVATAR + CART) ==================
app.use((req, res, next) => {

    const user = req.session.user || null;
    const cart = req.session.cart || [];

    // ================= CART COUNT =================
    const unique_product_count = new Set(
        cart.map(item => item.productId?.toString())
    ).size;

    // ================= AVATAR FIX =================
    let avatar_src = '/image/default.jpg';

    if (user?.anh_dai_dien) {

        const img = user.anh_dai_dien;

        if (img.startsWith('http')) {
            avatar_src = img;
        } 
        else if (img.startsWith('/image/')) {
            avatar_src = img;
        } 
        else {
            avatar_src = '/image/' + img;
        }
    }

    // ================= PUSH TO EJS =================
    res.locals.user = user;
    res.locals.avatar_src = avatar_src;
    res.locals.unique_product_count = unique_product_count;

    next();
});

// ================== MONGODB ==================
const uri = 'mongodb://ngoc:ngoc123@ac-wkqwdfb-shard-00-01.hwplpxk.mongodb.net:27017/trangsuc_db?ssl=true&authSource=admin';

mongoose.connect(uri)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));
// ================== ROUTES ==================
const homeRouter = require('./routers/homeRouter');
const authRouter = require('./routers/authRouter');
const sanphamRouter = require("./routers/sanphamRouter");
const productRouter = require("./routers/productRouter");
const pagesRouter = require("./routers/pagesRouter");
const lichsuRouter = require('./routers/lichsuRouter');
const giohangRouter = require('./routers/cartRouter');
const timkiemRouter = require("./routers/timkiemRouter");
const trangsucRouter = require("./routers/trangsucRouter");
const thanhtoanRouter = require("./routers/thanhtoanRouter");
const profileRouter = require('./routers/profileRouter');
app.use('/', profileRouter);
app.use("/", thanhtoanRouter);
app.use("/", trangsucRouter);
app.use("/", timkiemRouter);
app.use('/giohang', giohangRouter);
app.use("/", pagesRouter); 
app.use("/", productRouter);
app.use("/", lichsuRouter);
app.use('/', homeRouter);
app.use('/', authRouter);
app.use("/", sanphamRouter);
// ================== ERROR HANDLER ==================
try {
    const errorHandler = require('./middlewares/errorHadler');
    if (typeof errorHandler === 'function') {
        errorHandler(app);
    }
} catch (e) {
    console.log('⚠️ errorHadler missing');
}

// ================== SERVER ==================
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running http://localhost:${PORT}`);
});

