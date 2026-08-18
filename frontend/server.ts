import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse request bodies
  app.use(express.json());

  // Keep a simple in-memory database of received orders for demonstration
  const orders: any[] = [];

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // API Route: Handle real checkout orders
  app.post("/api/checkout", (req, res) => {
    const { fullName, phone, email, address, notes, paymentMethod, deliveryMethod, cart, finalTotal } = req.body;

    if (!fullName || !phone || !email || !address) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc để tiến hành đặt hàng." 
      });
    }

    if (!cart || cart.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Giỏ hàng rỗng." 
      });
    }

    // Generate a unique order ID
    const orderId = Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      orderId,
      fullName,
      phone,
      email,
      address,
      notes,
      paymentMethod,
      deliveryMethod,
      cart,
      finalTotal,
      status: "Chờ xác nhận thanh toán",
      statusType: "processing",
      paymentStatus: "pending",
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    // Simulated confirmation containing real processed payload
    res.status(200).json({
      success: true,
      message: "Đặt hàng thành công và được ghi nhận tại máy chủ Express!",
      orderId,
      order: newOrder
    });
  });

  // API Route: Get payment status of checkout orders (mock)
  app.get("/api/checkout/payment/status/:orderId", (req, res) => {
    const { orderId } = req.params;
    const order = orders.find(o => o.orderId === parseInt(orderId));
    if (order) {
      return res.json({
        success: true,
        order,
        payment: {
          provider: order.paymentMethod,
          status: order.paymentStatus || "pending",
          statusLabel: order.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán",
          reference: `TECHVIE-MOCK-${orderId}`,
          note: `TECHVIE ${orderId}`,
          paymentUrl: "",
        }
      });
    }
    res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
  });

  // Keep a simple in-memory database of customer contacts for demonstration
  const contacts: any[] = [
    {
      id: 1082,
      name: "Trần Anh Tú",
      email: "tuanhtu@gmail.com",
      subject: "Hợp tác phân phối sỉ",
      message: "Tôi có hệ thống cửa hàng điện máy cao cấp tại Đà Nẵng, muốn liên hệ làm đại lý chính thức để phân phối các dòng máy TechVie Book Pro X.",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
    },
    {
      id: 1094,
      name: "Hoàng Vy",
      email: "vyhoang99@hotmail.com",
      subject: "Cấu hình custom khắc tên",
      message: "Có chương trình hỗ trợ in ấn khắc laser tên riêng hoặc logo doanh nghiệp lên mặt sau điện thoại Titanium TechVie Ultra v1 không?",
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString() // 1 hour ago
    }
  ];

  // API Route: Send user contact inquiries
  app.post("/api/contacts", (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Họ tên và email là bắt buộc." });
    }
    const newInquiry = {
      id: Math.floor(1000 + Math.random() * 9000),
      name,
      email,
      subject: subject || "Yêu cầu tư vấn thiết bị",
      message: message || "",
      createdAt: new Date().toISOString()
    };
    contacts.push(newInquiry);
    res.json({ success: true, message: "Gửi liên hệ thành công!", inquiry: newInquiry });
  });

  // API Route: Retrieve all registered contacts (admin)
  app.get("/api/contacts", (req, res) => {
    res.json({ success: true, count: contacts.length, contacts });
  });

  // API Route: Update an order status (admin)
  app.post("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, statusType } = req.body;
    const order = orders.find(o => o.orderId === parseInt(id));
    if (order) {
      order.status = status;
      if (statusType) {
        order.statusType = statusType;
      }
      return res.json({ success: true, message: "Cập nhật trạng thái thành công!", order });
    }
    res.status(404).json({ success: false, message: "Không tìm thấy mã đơn hàng." });
  });

  // API Route: Delete all orders (admin helper)
  app.delete("/api/orders", (req, res) => {
    orders.length = 0;
    res.json({ success: true, message: "Đã xoá toàn bộ sổ đặt hàng trên máy chủ." });
  });

  // API Route: Feed premium home slider hero images
  app.get("/api/hero-images", (req, res) => {
    res.json([
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
    ]);
  });

  // API Route: Feed product categories
  app.get("/api/categories", (req, res) => {
    res.json({
      success: true,
      categories: ['Tất cả', 'Điện thoại', 'Laptop', 'Đồng hồ', 'Âm thanh', 'Bàn phím']
    });
  });

  // API Route: Retrieve all registered orders (optional/admin)
  app.get("/api/orders", (req, res) => {
    res.json({ success: true, count: orders.length, orders });
  });

  // Vite middleware setup for Development or Static Fileserving in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `\x1b[1;35m[TECHVIE EXPRESS SERVER]\x1b[0m \x1b[32monline at\x1b[0m \x1b[1;4;36mhttp://localhost:${PORT}\x1b[0m`
    );
  });
}

startServer();
