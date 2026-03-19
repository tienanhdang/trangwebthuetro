const express = require("express");
const router = express.Router();

const phongtroController = require("../controllers/phongtroController");
const authMiddleware = require("../middleware/authMiddleware");

// --- CÁC CHỨC NĂNG XEM (Ai cũng xem được) ---
router.get("/", phongtroController.getAllPhongTro);

router.get("/:id", phongtroController.getPhongTroById);

router.get("/:id/noithat", phongtroController.getNoiThat);

router.get("/:id/hinhanh", phongtroController.getHinhAnh);

// --- CHỨC NĂNG THÊM & XÓA (ĐÃ BỌC LỚP BẢO VỆ) ---
// Yêu cầu: Bắt buộc phải có thẻ JWT hợp lệ mới được đi qua 

//POST có verifyToken
router.post("/", authMiddleware.verifyToken, phongtroController.createPhongTro);

//DELETE có verifyToken
router.delete("/:id", authMiddleware.verifyToken, phongtroController.deletePhongTro);

module.exports = router;