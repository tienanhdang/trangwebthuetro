const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const phongtroController = require("../controllers/phongtroController");
const { verifyToken: authMiddleware } = require("../middleware/authMiddleware");


router.get(
  "/my",
  authMiddleware,
  phongtroController.getMyPhongTro
);

// --- CÁC CHỨC NĂNG XEM (Ai cũng xem được) ---
router.get("/", phongtroController.getAllPhongTro);

router.get("/:id/noithat", phongtroController.getNoiThat);

router.get("/:id/hinhanh", phongtroController.getHinhAnh);

// --- CHỨC NĂNG THÊM & XÓA (ĐÃ BỌC LỚP BẢO VỆ) ---
// Yêu cầu: Bắt buộc phải có thẻ JWT hợp lệ mới được đi qua 

//POST có verifyToken
router.post(
  "/",
  authMiddleware,
  upload.array("images", 10),
  phongtroController.createPhongTro
);

//DELETE có verifyToken
router.delete("/:id", authMiddleware, phongtroController.deletePhongTro);

//SỬA PHÒNG có verifyToken
router.put(
  "/:id", 
  authMiddleware, 
  upload.array("images", 10), // <--- PHẢI CÓ DÒNG NÀY
  phongtroController.updatePhongTro
);

//CẬP NHẬT TRẠNG THÁI có verifyToken 
router.patch("/:id/trangthai", authMiddleware, phongtroController.updateTrangThai);

router.get("/:id/lienhe", authMiddleware, phongtroController.getLienHe);
router.post("/:id/danhgia", authMiddleware, phongtroController.addDanhGia);
router.get("/:id/danhgia", phongtroController.getDanhGia);

router.get("/:id", phongtroController.getPhongTroById);

// ĐẶT PHÒNG - Route mới
router.post("/:id/datphong", authMiddleware, phongtroController.datPhong);

module.exports = router;
