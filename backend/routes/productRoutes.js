const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const { upload } = require("../config/cloudinary");

// 1. Lấy danh sách sản phẩm (Công khai)
router.get("/", productController.getProducts);

// 2. Thêm sản phẩm mới (Chỉ cho Admin, kèm upload ảnh)
router.post(
  "/",
  authMiddleware,
  authMiddleware.adminOnly,
  upload.single("imageFile"),
  productController.createProduct
);

// 3. Cập nhật sản phẩm (Chỉ cho Admin, hỗ trợ upload ảnh mới)
router.put(
  "/:id",
  authMiddleware,
  authMiddleware.adminOnly,
  upload.single("imageFile"),
  productController.updateProduct
);

// 4. Xóa sản phẩm (Chỉ cho Admin)
router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.adminOnly,
  productController.deleteProduct
);

// 5. Khôi phục sản phẩm (Chỉ cho Admin)
router.patch(
  "/:id/restore",
  authMiddleware,
  authMiddleware.adminOnly,
  productController.restoreProduct
);

module.exports = router;
