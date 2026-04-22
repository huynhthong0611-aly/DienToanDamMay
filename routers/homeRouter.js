const express = require('express');
const router = express.Router();
const Product = require('../models/SanPham');
const Category = require('../models/DanhMuc');

router.get('/', async (req, res) => {
    try {

            const topRated = await Product.aggregate([
            {
                $lookup: {
                    from: "danh_gia",
                    let: { pid: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$san_pham_id", "$$pid"]
                                }
                            }
                        },
                        {
                            $project: { so_sao: 1 }
                        }
                    ],
                    as: "reviews"
                }
            },
            {
                $addFields: {
                    tong_danhgia: { $size: "$reviews" },
                    avg_sao: {
                        $cond: [
                            { $gt: [{ $size: "$reviews" }, 0] },
                            { $avg: "$reviews.so_sao" },
                            0
                        ]
                    }
                }
            },

            // 👉 sort theo rating trước
            {
                $sort: {
                    avg_sao: -1,
                    tong_danhgia: -1
                }
            },

            // 👉 group theo danh mục (mỗi danh mục lấy 1 sp tốt nhất)
            {
                $group: {
                    _id: "$danh_muc_id",
                    product: { $first: "$$ROOT" }
                }
            },

            // 👉 lấy lại full product object
            {
                $replaceRoot: {
                    newRoot: "$product"
                }
            },

            // 👉 lấy 4 danh mục khác nhau
            { $limit: 4 }
        ]);

        const products = await Product.find({}).lean();

        console.log("TOP RATED:", topRated.length);
        console.log("PRODUCTS:", products.length);

        return res.render('index', {
            products,
            topRated
        });

    } catch (err) {
        console.error("❌ HOME ERROR:", err);

        return res.render('index', {
            products: [],
            topRated: []
        });
    }
});

module.exports = router;