const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

// Lấy danh sách danh mục (Công khai)
router.get("/", categoryController.getCategories);

// Tạo danh mục mới (Chỉ cho Admin)
router.post(
  "/",
  authMiddleware,
  authMiddleware.adminOnly,
  categoryController.createCategory
);

// Cập nhật danh mục (Chỉ cho Admin)
router.put(
  "/:id",
  authMiddleware,
  authMiddleware.adminOnly,
  categoryController.updateCategory
);

// Xóa danh mục (Soft Delete - Chỉ cho Admin)
router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.adminOnly,
  categoryController.deleteCategory
);

// Khôi phục danh mục (Chỉ cho Admin)
router.patch(
  "/:id/restore",
  authMiddleware,
  authMiddleware.adminOnly,
  categoryController.restoreCategory
);

// Toggle bật/tắt danh mục (Chỉ cho Admin)
router.patch(
  "/:id/toggle",
  authMiddleware,
  authMiddleware.adminOnly,
  categoryController.toggleCategory
);

// Xóa hẳn danh mục (Permanent Delete - Chỉ cho Admin)
router.delete(
  "/:id/permanent",
  authMiddleware,
  authMiddleware.adminOnly,
  categoryController.hardDeleteCategory
);

module.exports = router;
