const Category = require("../models/Category");

const categoryController = {
  // Lấy toàn bộ danh sách danh mục xếp theo thứ tự thời gian tạo
  getCategories: async (req, res) => {
    try {
      const { includeDeleted } = req.query;
      let query = {};
      
      // Nếu không yêu cầu lấy dữ liệu đã xóa, mặc định bỏ qua chúng
      if (includeDeleted !== 'true') {
        query.isDeleted = { $ne: true };
      }

      const categories = await Category.find(query).sort({ created_at: 1 });
      return res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách danh mục:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách danh mục từ database!",
        error: error.message,
      });
    }
  },

  // Xóa mềm danh mục
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục!",
        });
      }

      category.isDeleted = true;
      await category.save();

      return res.status(200).json({
        success: true,
        message: "Xóa mềm danh mục thành công!",
        category,
      });
    } catch (error) {
      console.error("Lỗi xóa danh mục:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xóa danh mục!",
        error: error.message,
      });
    }
  },

  // Khôi phục danh mục
  restoreCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục!",
        });
      }

      category.isDeleted = false;
      await category.save();

      return res.status(200).json({
        success: true,
        message: "Khôi phục danh mục thành công!",
        category,
      });
    } catch (error) {
      console.error("Lỗi khôi phục danh mục:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi khôi phục danh mục!",
        error: error.message,
      });
    }
  },
  
  // Tạo danh mục mới (Chỉ cho Admin)
  createCategory: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục không được để trống!",
        });
      }

      // Kiểm tra trùng tên (không phân biệt hoa thường)
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp("^" + name.trim() + "$", "i") }
      });

      if (existingCategory) {
        if (existingCategory.isDeleted) {
          // Khôi phục nếu đã bị xóa mềm trước đó
          existingCategory.isDeleted = false;
          await existingCategory.save();
          return res.status(200).json({
            success: true,
            message: "Danh mục đã tồn tại trước đó và đã được khôi phục thành công!",
            category: existingCategory,
          });
        }
        return res.status(400).json({
          success: false,
          message: "Tên danh mục đã tồn tại!",
        });
      }

      const newCategory = await Category.create({ name: name.trim() });
      return res.status(201).json({
        success: true,
        message: "Tạo danh mục mới thành công!",
        category: newCategory,
      });
    } catch (error) {
      console.error("Lỗi tạo danh mục:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi tạo danh mục!",
        error: error.message,
      });
    }
  },

  // Cập nhật danh mục (Chỉ cho Admin)
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục không được để trống!",
        });
      }

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục!",
        });
      }

      // Kiểm tra trùng tên với danh mục khác
      const duplicateCategory = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp("^" + name.trim() + "$", "i") }
      });

      if (duplicateCategory) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục đã tồn tại ở một danh mục khác!",
        });
      }

      category.name = name.trim();
      await category.save();

      return res.status(200).json({
        success: true,
        message: "Cập nhật danh mục thành công!",
        category,
      });
    } catch (error) {
      console.error("Lỗi cập nhật danh mục:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi cập nhật danh mục!",
        error: error.message,
      });
    }
  },

  // Toggle trạng thái bật/tắt danh mục (isDeleted = true/false)
  toggleCategory: async (req, res) => {
    try {
      const { id } = req.params;
      console.log('[BACKEND] toggleCategory requested for ID:', id);
      const category = await Category.findById(id);

      if (!category) {
        console.warn('[BACKEND] toggleCategory: Category not found for ID:', id);
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục!",
        });
      }

      category.isDeleted = !category.isDeleted;
      await category.save();
      console.log('[BACKEND] toggleCategory: Success. New status (isDeleted):', category.isDeleted);

      return res.status(200).json({
        success: true,
        message: category.isDeleted
          ? "Đã tắt danh mục thành công!"
          : "Đã bật lại danh mục thành công!",
        category,
      });
    } catch (error) {
      console.error("[BACKEND] Lỗi toggle danh mục:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi thay đổi trạng thái danh mục!",
        error: error.message,
      });
    }
  },

  // Xóa hẳn danh mục khỏi cơ sở dữ liệu (Permanent Delete)
  hardDeleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      console.log('[BACKEND] hardDeleteCategory requested for ID:', id);
      const category = await Category.findById(id);

      if (!category) {
        console.warn('[BACKEND] hardDeleteCategory: Category not found for ID:', id);
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục!",
        });
      }

      await Category.findByIdAndDelete(id);
      console.log('[BACKEND] hardDeleteCategory: Successfully deleted from database for ID:', id);

      return res.status(200).json({
        success: true,
        message: `Đã xóa hẳn danh mục "${category.name}" khỏi cơ sở dữ liệu!`,
      });
    } catch (error) {
      console.error("[BACKEND] Lỗi xóa hẳn danh mục:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xóa hẳn danh mục!",
        error: error.message,
      });
    }
  },
};

module.exports = categoryController;
