const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    description: "Họ tên người gửi",
  },
  email: {
    type: String,
    required: true,
    index: true,
    description: "Địa chỉ hòm thư nhận phản hồi",
  },
  subject: {
    type: String,
    required: true,
    description: "Tiêu đề liên hệ",
  },
  message: {
    type: String,
    required: true,
    description: "Nội dung ý kiến đóng góp",
  },
  created_at: {
    type: Date,
    default: Date.now,
    description: "Thời gian gửi liên hệ",
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
