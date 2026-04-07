const express = require("express");
const router = express.Router();

const danhgiaController = require("../controllers/danhgiaController");

// Lấy đánh giá
router.get("/:id", danhgiaController.getDanhGia);

// Thêm đánh giá
router.post("/", danhgiaController.addDanhGia);

module.exports = router;