const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profileController');
const multer = require('multer');

// ===== upload avatar (giống $_FILES PHP) =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowTypes = /jpg|jpeg|png|gif|webp/;
    const ext = allowTypes.test(file.originalname.toLowerCase());

    if (ext) {
        cb(null, true);
    } else {
        cb(new Error('Định dạng ảnh không hợp lệ'), false);
    }
};

const upload = multer({ storage, fileFilter });

// ===== ROUTES =====

// hiển thị hồ sơ
router.get('/capnhathoso', profileController.getProfile);

// cập nhật hồ sơ
router.post('/capnhathoso', upload.single('avatar'), profileController.updateProfile);

module.exports = router;