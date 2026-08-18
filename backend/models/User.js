const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return this.auth_provider === "credentials";
    },
  },
  phone: {
    type: String,
    // Nếu chưa cung cấp thì sao?
    default: "",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  vipStatus: {
    type: String,
    enum: ["Normal", "Premium"],
    default: "Normal",
  },
  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },
  google_id: {
    type: String,
    required: false,
    sparse: true,
    index: true,
  },
  auth_provider: {
    type: String,
    enum: ["credentials", "google"],
    default: "credentials",
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  // === THÊM MỚI: Trường hỗ trợ tính năng Quên Mật Khẩu ===
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpire: {
    type: Date,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpire: {
    type: Date,
    default: null,
  },
  // =========================================================
  created_at: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const UserModel = mongoose.model("User", userSchema);

const User = {
  // Tìm người dùng qua Email
  findByEmail: async (email) => {
    const doc = await UserModel.findOne({ email, isDeleted: { $ne: true } });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      password: doc.password,
      phone: doc.phone,
      role: doc.role,
      vipStatus: doc.vipStatus,
      status: doc.status,
      created_at: doc.created_at,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordExpire: doc.resetPasswordExpire,
      google_id: doc.google_id,
      auth_provider: doc.auth_provider,
      avatar: doc.avatar,
      address: doc.address,
      isEmailVerified: doc.isEmailVerified,
    };
  },

  // Tìm người dùng qua Username (Không phân biệt hoa thường)
  findByUsername: async (username) => {
    const doc = await UserModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
      isDeleted: { $ne: true },
    });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      password: doc.password,
      phone: doc.phone,
      role: doc.role,
      vipStatus: doc.vipStatus,
      status: doc.status,
      created_at: doc.created_at,
      google_id: doc.google_id,
      auth_provider: doc.auth_provider,
      avatar: doc.avatar,
      address: doc.address,
      isEmailVerified: doc.isEmailVerified,
    };
  },

  // Tìm người dùng qua ID
  findById: async (id, includeDeleted = false) => {
    let query = { _id: id };
    if (!includeDeleted) query.isDeleted = { $ne: true };
    const doc = await UserModel.findOne(query);
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      password: doc.password,
      phone: doc.phone,
      role: doc.role,
      vipStatus: doc.vipStatus,
      status: doc.status,
      created_at: doc.created_at,
      google_id: doc.google_id,
      auth_provider: doc.auth_provider,
      avatar: doc.avatar,
      address: doc.address,
      isEmailVerified: doc.isEmailVerified,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordExpire: doc.resetPasswordExpire,
      emailVerificationToken: doc.emailVerificationToken,
      emailVerificationExpire: doc.emailVerificationExpire,
    };
  },

  // Tìm người dùng qua Reset Token
  findByResetToken: async (token) => {
    const doc = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Token còn hạn
    });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordExpire: doc.resetPasswordExpire,
    };
  },

  // Tìm người dùng qua Verification Token
  findByVerificationToken: async (token) => {
    const doc = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() }, // Token còn hạn
    });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      isEmailVerified: doc.isEmailVerified,
    };
  },

  // Lấy tất cả người dùng
  findAll: async (includeDeleted = false) => {
    const query = includeDeleted ? {} : { isDeleted: { $ne: true } };
    const docs = await UserModel.find(query).sort({ created_at: -1 });
    return docs.map((doc) => ({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      phone: doc.phone,
      role: doc.role,
      vipStatus: doc.vipStatus,
      status: doc.status,
      created_at: doc.created_at,
      google_id: doc.google_id,
      auth_provider: doc.auth_provider,
      avatar: doc.avatar,
      address: doc.address,
      isEmailVerified: doc.isEmailVerified,
    }));
  },

  // Tạo người dùng mới
  create: async ({
    username,
    email,
    password,
    phone,
    role,
    vipStatus,
    status,
    google_id,
    auth_provider,
    avatar,
    address,
    isEmailVerified,
  }) => {
    const doc = await UserModel.create({
      username,
      email,
      password: password || undefined,
      phone: phone || "",
      role: role || "user",
      vipStatus: vipStatus || "Normal",
      status: status || "active",
      google_id,
      auth_provider: auth_provider || "credentials",
      avatar,
      address,
      isEmailVerified: isEmailVerified || false,
    });
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      phone: doc.phone,
      role: doc.role,
      vipStatus: doc.vipStatus,
      status: doc.status,
      created_at: doc.created_at,
      google_id: doc.google_id,
      auth_provider: doc.auth_provider,
      avatar: doc.avatar,
      address: doc.address,
      isEmailVerified: doc.isEmailVerified,
    };
  },

  // Cập nhật người dùng theo ID
  updateById: async (id, updates) => {
    const doc = await UserModel.findByIdAndUpdate(id, updates, { returnDocument: 'after' });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      phone: doc.phone,
      role: doc.role,
      vipStatus: doc.vipStatus,
      status: doc.status,
      created_at: doc.created_at,
      google_id: doc.google_id,
      auth_provider: doc.auth_provider,
      avatar: doc.avatar,
      address: doc.address,
      isEmailVerified: doc.isEmailVerified,
    };
  },

  // Xóa người dùng theo ID
  deleteById: async (id) => {
    const result = await UserModel.findByIdAndUpdate(id, {
      isDeleted: true,
      status: "blocked",
    });
    return !!result;
  },

  // Xóa hẳn tài khoản chưa xác thực theo email
  hardDeleteUnverifiedByEmail: async (email) => {
    const result = await UserModel.deleteMany({
      email: email.toLowerCase(),
      isEmailVerified: false,
    });
    return result.deletedCount > 0;
  },
};

module.exports = User;
