const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// API Đăng ký: POST /users/register
router.post("/register", userController.register);

// API Đăng nhập: POST /users/login
router.post("/login", userController.login);

module.exports = router;