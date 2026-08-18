const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");
const { oauthConfig } = require("../config/oauth");
const { exchangeCodeForTokens, fetchGoogleUserProfile } = require("../services/oauthService");

const authController = {
  getGoogleAuthUrl: async (req, res) => {
    try {
      const state = crypto.randomBytes(32).toString("hex");
      res.cookie("oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000
      });
      const { clientId, redirectUri, authUrl, scopes } = oauthConfig.google;
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scopes.join(" "),
        state: state,
        access_type: "offline",
        prompt: "consent"
      });
      return res.status(200).json({ success: true, url: `${authUrl}?${params.toString()}` });
    } catch (error) {
      console.error("Error generating Google Auth URL:", error);
      return res.status(500).json({ success: false, message: "Không thể tạo URL đăng nhập bằng Google." });
    }
  },

  googleCallback: async (req, res) => {
    try {
      const { code, state } = req.query;
      const storedState = req.cookies.oauth_state;
      res.clearCookie("oauth_state");

      if (!state || !storedState || state !== storedState) {
        return res.status(403).json({ success: false, message: "Cảnh báo bảo mật: Yêu cầu không hợp lệ." });
      }
      if (!code) {
        return res.status(400).json({ success: false, message: "Thiếu mã xác thực." });
      }

      const tokens = await exchangeCodeForTokens(code);
      const googleProfile = await fetchGoogleUserProfile(tokens.access_token);
      const { sub: googleId, email, name, picture: avatar } = googleProfile;

      let user = await User.findByEmail(email.toLowerCase());
      if (user) {
        if (user.status === "blocked") {
          return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa." });
        }
        if (!user.google_id) {
          // Tự động liên kết Google ID và cập nhật nhà cung cấp
          user = await User.updateById(user.id, { google_id: googleId, auth_provider: "google", isEmailVerified: true });
        }
      } else {
        user = await User.create({
          email: email.toLowerCase(),
          google_id: googleId,
          auth_provider: "google",
          username: name,
          avatar: avatar || "",
          role: "user",
          vipStatus: "Normal",
          status: "active",
          isEmailVerified: true
        });
      }

      const jwtSecret = process.env.JWT_SECRET || "techvie_jwt_secret_key_2026";
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: "24h" }
      );

      res.cookie("techvie_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/?token=Bearer ${token}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      return res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng nhập Google OAuth2." });
    }
  },

  // 1. Đăng ký tài khoản
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate thông tin
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ các trường thông tin: username, email, password!",
        });
      }

      // Kiểm tra email trùng lặp
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        if (existingUser.isEmailVerified === false) {
          // Xóa tài khoản chưa kích hoạt/chưa xác minh cũ để giải phóng email cho chủ sở hữu thực sự
          await User.hardDeleteUnverifiedByEmail(email);
        } else {
          return res.status(409).json({
            success: false,
            message: "Email này đã được sử dụng bởi tài khoản khác!",
          });
        }
      }

      // Kiểm tra username trùng lặp
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Tên đăng nhập này đã được sử dụng bởi tài khoản khác!",
        });
      }

      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Lưu người dùng mới vào database
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      // Tạo mã JWT Token tự động khi đăng ký thành công
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          role: newUser.role || "user" 
        },
        process.env.JWT_SECRET || "techvie_jwt_secret_key_2026",
        { expiresIn: "24h" }
      );

      return res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công!",
        token: `Bearer ${token}`,
        user: newUser,
      });
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra trong quá trình đăng ký!",
        error: error.message,
      });
    }
  },

  // 1.5 Kiểm tra email tồn tại
  checkEmail: async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ success: false, message: "Thiếu email để kiểm tra!" });
      }
      const existingUser = await User.findByEmail(email.toLowerCase());
      const isTaken = existingUser && existingUser.isEmailVerified;
      return res.status(200).json({
        success: true,
        exists: !!isTaken,
        message: isTaken ? "Email này đã được sử dụng bởi tài khoản khác!" : "Email khả dụng."
      });
    } catch (error) {
      console.error("Lỗi kiểm tra email:", error);
      return res.status(500).json({ success: false, message: "Lỗi kết nối máy chủ khi kiểm tra email." });
    }
  },

  // 2. Đăng nhập tài khoản
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate thông tin
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ email và password!",
        });
      }

      // Kiểm tra người dùng tồn tại bằng UserModel gốc để lấy cả user đã xóa
      const UserModel = require("../models/User").model ? require("../models/User").model("User") : require("mongoose").model("User");
      const fullUser = await UserModel.findOne({
        $or: [
          { email: email },
          { username: email }
        ]
      });
      if (!fullUser) {
        return res.status(401).json({
          success: false,
          message: "Tài khoản hoặc mật khẩu không chính xác!",
        });
      }

      if (fullUser.isDeleted || fullUser.status === 'blocked') {
        return res.status(403).json({
          success: false,
          message: "Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa!",
        });
      }

      if (fullUser.auth_provider === "google") {
        return res.status(409).json({
          success: false,
          message: "Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập bằng Google.",
        });
      }

      // So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, fullUser.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Tài khoản hoặc mật khẩu không chính xác!",
        });
      }

      // Tạo mã JWT Token
      const token = jwt.sign(
        { 
          id: fullUser._id.toString(), 
          email: fullUser.email, 
          role: fullUser.email === "admin@techvie.com" ? "admin" : "user" 
        },
        process.env.JWT_SECRET || "techvie_jwt_secret_key_2026",
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công!",
        token: `Bearer ${token}`,
        user: {
          id: fullUser._id.toString(),
          username: fullUser.username,
          email: fullUser.email,
          created_at: fullUser.created_at,
          role: fullUser.email === "admin@techvie.com" ? "admin" : "user",
        },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra trong quá trình đăng nhập!",
        error: error.message,
      });
    }
  },

  // 3. Lấy thông tin cá nhân (Protected Route)
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng!",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin cá nhân:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra!",
        error: error.message,
      });
    }
  },

  // 3.5 Cập nhật thông tin cá nhân (Protected Route)
  updateProfile: async (req, res) => {
    try {
      const { name, phone, address } = req.body;
      const userId = req.user.id;

      const updatedUser = await User.updateById(userId, {
        username: name,
        phone,
        address
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng để cập nhật!",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công!",
        user: {
          ...updatedUser,
          name: updatedUser.username // Ánh xạ username thành name để khớp cấu trúc Frontend
        },
      });
    } catch (error) {
      console.error("Lỗi cập nhật thông tin cá nhân:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi cập nhật hồ sơ!",
        error: error.message,
      });
    }
  },

  // 4. Quên mật khẩu — Gửi email chứa link đặt lại mật khẩu
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập địa chỉ email!",
        });
      }

      // Tìm tài khoản theo email
      const user = await User.findByEmail(email);
      if (!user) {
        // Trả về thông báo chung để tránh lộ thông tin tài khoản
        return res.status(200).json({
          success: true,
          message:
            "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!",
        });
      }

      // Ngăn chặn tài khoản liên kết Google sử dụng chức năng khôi phục mật khẩu
      if (user.auth_provider === "google") {
        return res.status(409).json({
          success: false,
          message: "Tài khoản của bạn đăng ký bằng Google. Vui lòng đăng nhập trực tiếp qua nút Đăng nhập bằng Google.",
        });
      }

      // Kiểm tra cooldown chống spam (chờ ít nhất 60 giây)
      if (user.resetPasswordToken && user.resetPasswordExpire) {
        const timeElapsedSinceLastSent = 15 * 60 * 1000 - (new Date(user.resetPasswordExpire).getTime() - Date.now());
        const cooldownMs = 60 * 1000;
        if (timeElapsedSinceLastSent < cooldownMs) {
          const secondsLeft = Math.ceil((cooldownMs - timeElapsedSinceLastSent) / 1000);
          return res.status(429).json({
            success: false,
            message: `Yêu cầu gửi mail đặt lại mật khẩu quá nhanh. Vui lòng thử lại sau ${secondsLeft} giây.`
          });
        }
      }

      // Tạo token ngẫu nhiên (32 bytes hex = 64 ký tự)
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Lưu token đã hash vào DB (không lưu token gốc để tránh rủi ro bảo mật)
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      const expireTime = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

      await User.updateById(user.id, {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: expireTime,
      });

      // Tạo link reset password gửi cho người dùng
      // Token gốc (chưa hash) được đặt trong URL để người dùng gửi lại
      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

      // Nội dung email HTML (Thiết kế tối giản Trắng & Đen cao cấp của TechVie)
      const emailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #111111;">
          <div style="text-align: center; border-bottom: 1px solid #e5e5e5; padding-bottom: 30px; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; color: #000000;">TECHVIE</h1>
            <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #71717a; margin: 5px 0 0;">Refractive Excellence</p>
          </div>
          <div style="padding: 10px 0;">
            <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 20px; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">Yêu cầu đặt lại mật khẩu</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin-bottom: 20px;">
              Xin chào <strong>${user.username}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin-bottom: 30px;">
              Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}"
                style="background-color: #000000; color: #ffffff; padding: 16px 40px; text-decoration: none;
                       border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;
                       letter-spacing: 0.2em; text-transform: uppercase; transition: background 0.2s ease;">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <p style="font-size: 12px; line-height: 1.6; color: #71717a; margin-top: 40px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
              Đường dẫn này chỉ có hiệu lực trong vòng <strong>15 phút</strong>.
            </p>
            <p style="font-size: 11px; line-height: 1.6; color: #a1a1aa; word-break: break-all;">
              Nếu nút trên không hoạt động, bạn có thể sao chép liên kết dưới đây vào trình duyệt:<br/>
              <a href="${resetUrl}" style="color: #000000; text-decoration: underline;">${resetUrl}</a>
            </p>
          </div>
          <div style="text-align: center; margin-top: 50px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
            <p style="font-size: 10px; letter-spacing: 0.1em; color: #a1a1aa; text-transform: uppercase; margin: 0;">
              © ${new Date().getFullYear()} TechVie Shop. All rights reserved.
            </p>
          </div>
        </div>
      `;

      // Gửi email
      try {
        await sendEmail({
          to: user.email,
          subject: "[TechVie] Yêu cầu đặt lại mật khẩu",
          html: emailHtml,
        });
      } catch (emailErr) {
        console.error("Lỗi gửi email đặt lại mật khẩu:", emailErr);
        console.log("\n=======================================================");
        console.log(`[DEV EMAIL FALLBACK] Reset password link for ${user.email}:`);
        console.log(resetUrl);
        console.log("=======================================================\n");
        return res.status(200).json({
          success: true,
          message:
            "Yêu cầu đặt lại mật khẩu đã được xử lý (Vui lòng kiểm tra Terminal/Console của server backend để lấy link đặt lại mật khẩu!)",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!",
      });
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);

      // Nếu gửi email thất bại, xóa token đã lưu để tránh token "treo"
      try {
        const user = await User.findByEmail(req.body.email);
        if (user) {
          await User.updateById(user.id, {
            resetPasswordToken: null,
            resetPasswordExpire: null,
          });
        }
      } catch (_) {}

      return res.status(500).json({
        success: false,
        message: "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau!",
        error: error.message,
      });
    }
  },

  // 5. Đặt lại mật khẩu — Xác thực token và cập nhật mật khẩu mới vào DB
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;       // Token gốc từ URL
      const { newPassword } = req.body;   // Mật khẩu mới người dùng nhập

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token đặt lại mật khẩu không hợp lệ!",
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự!",
        });
      }

      // Hash token nhận từ URL để so sánh với token đã lưu trong DB
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Tìm người dùng có token hợp lệ và chưa hết hạn
      const user = await User.findByResetToken(hashedToken);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (15 phút)!",
        });
      }

      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Cập nhật mật khẩu mới và xóa token trong DB
      await User.updateById(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      });

      return res.status(200).json({
        success: true,
        message:
          "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.",
      });
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi đặt lại mật khẩu!",
        error: error.message,
      });
    }
  },

  // 6. Đổi mật khẩu cho người dùng đang đăng nhập
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!",
        });
      }

      // Tìm user trong DB
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy tài khoản người dùng!",
        });
      }

      // So sánh mật khẩu hiện tại
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu hiện tại không chính xác!",
        });
      }

      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Cập nhật
      await User.updateById(userId, { password: hashedPassword });

      return res.status(200).json({
        success: true,
        message: "Thay đổi mật khẩu thành công!",
      });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi đổi mật khẩu!",
        error: error.message,
      });
    }
  },

  // 7. Lấy danh sách thiết bị đã mua thành công của người dùng
  getMyDevices: async (req, res) => {
    try {
      const email = req.user.email;
      const orders = await Order.find({ 
        email: { $regex: new RegExp("^" + email + "$", "i") }, 
        status_type: "success" 
      }).sort({ created_at: -1 });

      const devices = [];
      const ProductModel = mongoose.models.Product || mongoose.model("Product");

      for (const order of orders) {
        for (const item of order.items) {
          // Lấy thông số gốc từ collection Product để vẽ ra specs thật
          const productDoc = await ProductModel.findOne({ id: item.product_id });
          const specs = productDoc ? productDoc.specs : [
            { label: "Bảo hành", value: "24 tháng" },
            { label: "Trạng thái", value: "Chính hãng TechVie" }
          ];

          const purchaseDate = new Date(order.created_at);
          const warrantyDate = new Date(purchaseDate);
          warrantyDate.setFullYear(warrantyDate.getFullYear() + 2); // Mặc định bảo hành 2 năm

          devices.push({
            id: item.product_id,
            name: item.product_name,
            price: item.product_price,
            purchaseDate: purchaseDate.toLocaleDateString("vi-VN"),
            warrantyDate: warrantyDate.toLocaleDateString("vi-VN"),
            specs: specs,
            image: productDoc ? productDoc.image : null
          });
        }
      }

      return res.status(200).json({
        success: true,
        devices
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách thiết bị cá nhân:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi kết nối khi tải danh sách thiết bị.",
        error: error.message
      });
    }
  },

  // 8. Gửi email xác thực tài khoản qua SMTP
  sendVerificationEmail: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ success: false, message: "Email này đã được xác thực rồi!" });
      }

      // Kiểm tra cooldown chống spam (chờ ít nhất 60 giây)
      if (user.emailVerificationToken && user.emailVerificationExpire) {
        const timeElapsedSinceLastSent = 24 * 60 * 60 * 1000 - (new Date(user.emailVerificationExpire).getTime() - Date.now());
        const cooldownMs = 60 * 1000;
        if (timeElapsedSinceLastSent < cooldownMs) {
          const secondsLeft = Math.ceil((cooldownMs - timeElapsedSinceLastSent) / 1000);
          return res.status(429).json({
            success: false,
            message: `Yêu cầu gửi mail xác thực quá nhanh. Vui lòng thử lại sau ${secondsLeft} giây.`
          });
        }
      }

      // Tạo verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
      const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ hiệu lực

      await User.updateById(userId, {
        emailVerificationToken: hashedToken,
        emailVerificationExpire: expireTime,
      });

      const verifyUrl = `${process.env.API_BASE_URL || "http://localhost:5000"}/api/auth/verify-email?token=${verificationToken}`;

      const emailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #111111;">
          <div style="text-align: center; border-bottom: 1px solid #e5e5e5; padding-bottom: 30px; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; color: #000000;">TECHVIE</h1>
            <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #71717a; margin: 5px 0 0;">Refractive Excellence</p>
          </div>
          <div style="padding: 10px 0;">
            <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 20px; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">Xác thực địa chỉ email</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin-bottom: 20px;">
              Xin chào <strong>${user.username}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin-bottom: 30px;">
              Cảm ơn bạn đã đồng hành cùng TechVie. Vui lòng nhấp vào nút dưới đây để xác thực địa chỉ email của bạn.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verifyUrl}"
                style="background-color: #000000; color: #ffffff; padding: 16px 40px; text-decoration: none;
                       border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;
                       letter-spacing: 0.2em; text-transform: uppercase; transition: background 0.2s ease;">
                XÁC THỰC EMAIL
              </a>
            </div>
            
            <p style="font-size: 12px; line-height: 1.6; color: #71717a; margin-top: 40px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
              Liên kết này có hiệu lực trong vòng <strong>24 giờ</strong>.
            </p>
            <p style="font-size: 11px; line-height: 1.6; color: #a1a1aa; word-break: break-all;">
              Nếu nút trên không hoạt động, bạn có thể sao chép liên kết dưới đây vào trình duyệt:<br/>
              <a href="${verifyUrl}" style="color: #000000; text-decoration: underline;">${verifyUrl}</a>
            </p>
          </div>
          <div style="text-align: center; margin-top: 50px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
            <p style="font-size: 10px; letter-spacing: 0.1em; color: #a1a1aa; text-transform: uppercase; margin: 0;">
              © ${new Date().getFullYear()} TechVie Shop. All rights reserved.
            </p>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          to: user.email,
          subject: "[TechVie] Xác thực địa chỉ email của bạn",
          html: emailHtml,
        });
      } catch (emailErr) {
        console.error("Lỗi gửi email xác thực:", emailErr);
        console.log("\n=======================================================");
        console.log(`[DEV EMAIL FALLBACK] Email verification link for ${user.email}:`);
        console.log(verifyUrl);
        console.log("=======================================================\n");
        return res.status(200).json({
          success: true,
          message: "Email xác thực đã được gửi (Vui lòng kiểm tra Terminal/Console của server backend để lấy link xác thực!)"
        });
      }

      return res.status(200).json({ success: true, message: "Email xác thực đã được gửi, vui lòng kiểm tra hộp thư của bạn!" });
    } catch (error) {
      console.error("Lỗi gửi email xác thực:", error);
      return res.status(500).json({ success: false, message: "Lỗi hệ thống khi gửi email xác thực." });
    }
  },

  // 9. Xác thực email thông qua token nhận được từ liên kết
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).send("Thiếu token xác thực.");
      }

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const user = await User.findByVerificationToken(hashedToken);

      if (!user) {
        return res.status(400).send("Liên kết xác thực không hợp lệ hoặc đã hết hạn.");
      }

      await User.updateById(user.id, {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpire: null,
      });

      // Redirect về trang cá nhân của Frontend kèm theo query param báo thành công
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/account?verified=true`);
    } catch (error) {
      console.error("Lỗi xác thực email:", error);
      return res.status(500).send("Lỗi hệ thống khi xác thực email.");
    }
  },
};

module.exports = authController;
