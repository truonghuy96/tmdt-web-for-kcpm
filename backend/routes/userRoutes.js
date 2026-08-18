const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Bảo vệ tất cả các API quản lý thành viên bằng xác thực Token và quyền Admin
router.use(authMiddleware);
router.use(authMiddleware.adminOnly);

// Định nghĩa các cổng kết nối API quản lý thành viên
router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.put("/:id/role", userController.toggleRole);
router.put("/:id/vip", userController.toggleVip);
router.put("/:id/status", userController.toggleStatus);
router.delete("/:id", userController.deleteUser);
router.patch("/:id/restore", userController.restoreUser);

module.exports = router;
