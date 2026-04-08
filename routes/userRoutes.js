const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);

// Đảm bảo các dòng này nằm TRÊN module.exports
router.get("/admin/users", userController.getAllUsers);
router.delete("/admin/users/:id", userController.deleteUser);

module.exports = router; // Luôn để ở cuối