const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image/');
    },
    filename: (req, file, cb) => {
        // 👉 GIỮ NGUYÊN TÊN FILE GỐC
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allow = /jpg|jpeg|png|gif|webp/;

    if (allow.test(file.originalname.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Sai định dạng ảnh'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;