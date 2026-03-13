const express = require("express");
const router = express.Router();

const danhgiaController = require("../controllers/danhgiaController");

router.get("/:id/danhgia", danhgiaController.getDanhGia);

module.exports = router;
