const express = require("express");
const router = express.Router();

const phongtroController = require("../controllers/phongtroController");

router.get("/", phongtroController.getAllPhongTro);

router.get("/:id", phongtroController.getPhongTroById);

router.get("/:id/noithat", phongtroController.getNoiThat);

router.get("/:id/hinhanh", phongtroController.getHinhAnh);

router.post("/", phongtroController.createPhongTro);

module.exports = router;