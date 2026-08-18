const bcrypt = require("bcryptjs");
const User = require("../models/User");

const userController = {
  // 1. Lấy danh sách tất cả thành viên
  getAllUsers: async (req, res) => {
    try {
      const { includeDeleted } = req.query;
      const users = await User.findAll(includeDeleted === 'true');
      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách thành viên:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy danh sách thành viên!",
        error: error.message,
      });
    }
  },

  // 2. Admin cấp tài khoản thành viên mới
  createUser: async (req, res) => {
    try {
      const { username, email, phone, role, vipStatus } = req.body;

      if (!username || !email) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ các trường bắt buộc: Họ và Tên, Email!",
        });
      }

      // Kiểm tra email trùng lặp
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email này đã được đăng ký bởi tài khoản khác!",
        });
      }

      // Tạo mật khẩu mặc định được mã hóa cho tài khoản mới cấp
      // Mật khẩu mặc định
      const defaultPassword = "123456"; 
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        phone: phone || "",
        role: role || "user",
        vipStatus: vipStatus || "Normal",
        status: "active",
      });

      return res.status(201).json({
        success: true,
        message: "Cấp tài khoản thành viên mới thành công!",
        user: newUser,
      });
    } catch (error) {
      console.error("Lỗi cấp tài khoản mới:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi tạo tài khoản mới!",
        error: error.message,
      });
    }
  },

  // 3. Thay đổi quyền truy cập (Standard User <-> Administrator)
  toggleRole: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thành viên!",
        });
      }

      // Ngăn chặn đổi quyền của tài khoản Admin chính
      if (user.email === "admin@techvie.com") {
        return res.status(403).json({
          success: false,
          message: "Không thể thay đổi phân quyền của tài khoản quản trị chính!",
        });
      }

      const newRole = user.role === "admin" ? "user" : "admin";
      const updatedUser = await User.updateById(id, { role: newRole });

      return res.status(200).json({
        success: true,
        message: `Thay đổi phân quyền thành ${newRole === "admin" ? "Administrator" : "Standard User"} thành công!`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Lỗi đổi phân quyền:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi thay đổi phân quyền!",
        error: error.message,
      });
    }
  },

  // 4. Thay đổi trạng thái VIP (Normal <-> Premium)
  toggleVip: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thành viên!",
        });
      }

      const newVip = user.vipStatus === "Premium" ? "Normal" : "Premium";
      const updatedUser = await User.updateById(id, { vipStatus: newVip });

      return res.status(200).json({
        success: true,
        message: `Thay đổi trạng thái VIP thành ${newVip} thành công!`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái VIP:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi thay đổi trạng thái VIP!",
        error: error.message,
      });
    }
  },

  // 5. Khóa / Mở khóa tài khoản thành viên (active <-> blocked)
  toggleStatus: async (req, res) => {
    try {
      const { id } = req.params;

      // Không cho phép tự khóa chính mình
      if (req.user && req.user.id === id) {
        return res.status(403).json({
          success: false,
          message: "Bạn không thể tự khóa tài khoản quản trị đang đăng nhập của mình!",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thành viên!",
        });
      }

      if (user.email === "admin@techvie.com") {
        return res.status(403).json({
          success: false,
          message: "Không thể khóa tài khoản quản trị chính!",
        });
      }

      const newStatus = user.status === "active" ? "blocked" : "active";
      const updatedUser = await User.updateById(id, { status: newStatus });

      return res.status(200).json({
        success: true,
        message: `${newStatus === "active" ? "Mở khóa" : "Khóa"} tài khoản thành viên thành công!`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái tài khoản:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi thay đổi trạng thái tài khoản!",
        error: error.message,
      });
    }
  },

  // 6. Gỡ bỏ tài khoản thành viên khỏi cơ sở dữ liệu
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Không cho phép tự xóa chính mình
      if (req.user && req.user.id === id) {
        return res.status(403).json({
          success: false,
          message: "Bạn không thể tự gỡ bỏ tài khoản quản trị đang đăng nhập của mình!",
        });
      }

      const user = await User.findById(id, true);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thành viên!",
        });
      }

      if (user.email === "admin@techvie.com") {
        return res.status(403).json({
          success: false,
          message: "Không thể xóa tài khoản quản trị chính!",
        });
      }

      const deleted = await User.deleteById(id);

      if (deleted) {
        return res.status(200).json({
          success: true,
          message: "Xóa mềm tài khoản thành viên thành công!",
        });
      } else {
        throw new Error("Không thể xóa bản ghi khỏi database.");
      }
    } catch (error) {
      console.error("Lỗi gỡ bỏ thành viên:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xóa thành viên!",
        error: error.message,
      });
    }
  },

  // 7. Khôi phục tài khoản thành viên bị xóa mềm
  restoreUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id, true);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thành viên!",
        });
      }

      const updatedUser = await User.updateById(id, { isDeleted: false, status: 'active' });

      return res.status(200).json({
        success: true,
        message: "Khôi phục tài khoản thành viên thành công!",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Lỗi khôi phục thành viên:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi khôi phục thành viên!",
        error: error.message,
      });
    }
  }
};

module.exports = userController;
