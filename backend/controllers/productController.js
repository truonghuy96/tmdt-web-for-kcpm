const Product = require("../models/Product");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { uploadImage } = require("../services/uploadService");


// Helper trích xuất public_id từ Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1];
    const cleanPath = pathAfterUpload.replace(/^v\d+\//, "");
    return cleanPath.substring(0, cleanPath.lastIndexOf("."));
  } catch (err) {
    console.error("Lỗi trích xuất publicId từ URL:", err);
    return null;
  }
};

const productController = {
  // 1. Lấy danh sách sản phẩm (Hỗ trợ tìm kiếm thông qua query parameter 'search')
  getProducts: async (req, res) => {
    try {
      const { search, includeDeleted } = req.query;
      let query = {};
      
      if (includeDeleted !== 'true') {
        query.isDeleted = { $ne: true };
        
        // Tự động ẩn các sản phẩm thuộc danh mục đã bị tắt (soft deleted/disabled)
        try {
          const Category = require("../models/Category");
          const disabledCategories = await Category.find({ isDeleted: true }, 'name');
          if (disabledCategories.length > 0) {
            const disabledNames = disabledCategories.map(cat => cat.name);
            console.log('[BACKEND] Hiding products under disabled categories:', disabledNames);
            query.category = { $nin: disabledNames };
          }
        } catch (catError) {
          console.error("Lỗi khi tìm danh mục bị tắt:", catError);
        }
      }
      
      if (search) {
        const searchRegex = new RegExp(search.trim(), "i");
        // Nếu đã có điều kiện category, ta gộp lại bằng $and để tránh đè query
        const searchOrCond = [
          { name: searchRegex },
          { description: searchRegex }
        ];
        
        // Nếu category không bị cấm do đã tắt, cho phép tìm kiếm theo category
        if (!query.category) {
          searchOrCond.push({ category: searchRegex });
        }
        
        if (query.category) {
          query.$and = [
            { category: query.category },
            { $or: searchOrCond }
          ];
        } else {
          query.$or = searchOrCond;
        }

        // Ghi log tìm kiếm để tính phổ biến & lịch sử gần đây
        try {
          let userId = null;
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "techvie_jwt_secret_key_2026");
            userId = decoded.id || decoded.email || null;
          }
          
          const SearchLog = require("../models/SearchLog");
          await SearchLog.create({
            query: search.trim(),
            userId: userId,
            ip: req.ip || req.connection.remoteAddress
          });
        } catch (logErr) {
          console.error("Lỗi ghi log tìm kiếm:", logErr);
        }
      }
      
      const products = await Product.find(query);
      return res.status(200).json(products);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách sản phẩm từ database!",
        error: error.message,
      });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, price, stock, category, description, specs, colors, badge } = req.body;

      if (!name || !price || !category) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ: name, price, category!",
        });
      }

      // Tạo slug ID độc nhất cho sản phẩm
      const slugId = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      let uniqueId = slugId || "product";
      let count = 1;
      while (await Product.findById(uniqueId)) {
        uniqueId = `${slugId}-${count}`;
        count++;
      }

      // Upload ảnh với cơ chế Fallback (ImageKit -> Cloudinary)
      let imageUrl = req.body.image || "";
      if (req.file) {
        const uploadResult = await uploadImage(req.file.buffer, req.file.originalname, "techvie_products");
        imageUrl = uploadResult.url;
      }


      // Parse specs từ JSON string (nếu gửi bằng form-data)
      let parsedSpecs = [];
      if (specs) {
        try {
          parsedSpecs = typeof specs === "string" ? JSON.parse(specs) : specs;
        } catch (e) {
          console.warn("Lỗi parse specs JSON:", e);
          parsedSpecs = [];
        }
      }

      // Parse colors từ JSON string hoặc mảng
      let parsedColors = [];
      if (colors) {
        try {
          parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
        } catch (e) {
          console.warn("Lỗi parse colors JSON:", e);
          parsedColors = [];
        }
      }

      const newProduct = new Product({
        _id: uniqueId,
        name,
        price: Number(price),
        stock: stock !== undefined ? Number(stock) : 0,
        category,
        image: imageUrl,
        description: description || "",
        specs: parsedSpecs,
        colors: parsedColors,
        badge: badge || "NORMAL",
      });

      await newProduct.save();

      return res.status(201).json({
        success: true,
        message: "Thêm sản phẩm thành công vào MongoDB & Cloudinary!",
        product: newProduct,
      });
    } catch (error) {
      console.error("Lỗi thêm sản phẩm:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi thêm sản phẩm!",
        error: error.message,
      });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, stock, category, description, specs, colors, badge } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm cần cập nhật!",
        });
      }

      if (name) product.name = name;
      if (price !== undefined) product.price = Number(price);
      if (stock !== undefined) product.stock = Number(stock);
      if (category) product.category = category;
      if (description !== undefined) product.description = description;
      if (badge !== undefined) product.badge = badge;

      if (specs) {
        try {
          product.specs = typeof specs === "string" ? JSON.parse(specs) : specs;
        } catch (e) {
          console.warn("Lỗi parse specs JSON khi update:", e);
        }
      }

      if (colors) {
        try {
          product.colors = typeof colors === "string" ? JSON.parse(colors) : colors;
        } catch (e) {
          console.warn("Lỗi parse colors JSON khi update:", e);
        }
      }

      if (req.file) {
        // Xóa ảnh cũ trên Cloudinary trước khi tải ảnh mới lên
        if (product.image) {
          const oldPublicId = getPublicIdFromUrl(product.image);
          if (oldPublicId) {
            console.log(`[CLOUDINARY] Xóa ảnh cũ khi cập nhật sản phẩm: ${oldPublicId}`);
            await deleteFromCloudinary(oldPublicId).catch(err => 
              console.error("Lỗi xóa ảnh cũ khi cập nhật:", err)
            );
          }
        }
        const uploadResult = await uploadImage(req.file.buffer, req.file.originalname, "techvie_products");
        product.image = uploadResult.url;

      } else if (req.body.image !== undefined) {
        product.image = req.body.image;
      }

      await product.save();

      return res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công!",
        product,
      });
    } catch (error) {
      console.error("Lỗi cập nhật sản phẩm:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi cập nhật sản phẩm!",
        error: error.message,
      });
    }
  },

  // 4. Xóa sản phẩm
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm cần xóa!",
        });
      }

      // Thực hiện xóa mềm
      product.isDeleted = true;
      product.status = "DISCONTINUED";
      await product.save();

      return res.status(200).json({
        success: true,
        message: "Xóa mềm sản phẩm thành công (chuyển sang Ngừng kinh doanh)!",
        deletedProduct: product,
      });
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xóa sản phẩm!",
        error: error.message,
      });
    }
  },

  // 5. Khôi phục sản phẩm
  restoreProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm cần khôi phục!",
        });
      }

      product.isDeleted = false;
      product.status = "AVAILABLE";
      await product.save();

      return res.status(200).json({
        success: true,
        message: "Khôi phục sản phẩm thành công!",
        restoredProduct: product,
      });
    } catch (error) {
      console.error("Lỗi khôi phục sản phẩm:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi khôi phục sản phẩm!",
        error: error.message,
      });
    }
  },
};

module.exports = productController;
