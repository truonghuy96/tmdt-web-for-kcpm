# Hướng Dẫn Cấu Hình MongoDB & Cloudinary Cho Backend Express

Tài liệu này hướng dẫn cách cài đặt, cấu hình và viết code kết nối cơ sở dữ liệu **MongoDB** (sử dụng Mongoose) và dịch vụ lưu trữ ảnh **Cloudinary** (sử dụng Multer) cho dự án Backend Express.

---

## 1. Cài đặt các thư viện cần thiết

Để bắt đầu, bạn cần cài đặt các package sau vào backend:

```bash
npm install mongoose cloudinary multer dotenv
npm install --save-dev @types/multer
```

* **mongoose**: Thư viện ODM (Object Data Modeling) giúp kết nối và làm việc với MongoDB dễ dàng thông qua Schema.
* **cloudinary**: SDK chính thức của Cloudinary để tương tác với API lưu trữ hình ảnh.
* **multer**: Middleware xử lý file upload (multipart/form-data) trong Express.
* **dotenv**: Trình quản lý biến môi trường để bảo mật thông tin kết nối.

---

## 2. Cấu hình biến môi trường (`.env`)

Tạo hoặc cập nhật file `.env` ở thư mục gốc của Backend với nội dung cấu hình sau:

```env
# MongoDB Connection URI (Thay bằng URI thực tế từ MongoDB Atlas của bạn)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/techvie_db?retryWrites=true&w=majority"

# Cloudinary Credentials (Lấy từ Dashboard của Cloudinary)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

---

## 3. Khởi tạo kết nối MongoDB (`src/config/db.ts` hoặc `db.ts`)

Đoạn code sau thực hiện kết nối ứng dụng Express với cơ sở dữ liệu MongoDB:

```typescript
import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const connUri = process.env.MONGODB_URI;
    if (!connUri) {
      throw new Error("MONGODB_URI chưa được cấu hình trong biến môi trường!");
    }
    
    await mongoose.connect(connUri);
    console.log('✅ Kết nối MongoDB thành công!');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    process.exit(1); // Dừng server nếu kết nối DB thất bại
  }
}
```

---

## 4. Định nghĩa Mongoose Model (`src/models/Product.ts`)

Định nghĩa cấu trúc dữ liệu cho sản phẩm lưu trữ trong MongoDB:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  image: string; // URL ảnh lưu trên Cloudinary
  category: string;
  description: string;
  specs: { label: string; value: string }[];
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  specs: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true }
    }
  ]
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
```

---

## 5. Cấu hình Cloudinary & Multer Middleware (`src/config/cloudinary.ts`)

Thiết lập Cloudinary và cấu hình Multer để tiếp nhận file upload tạm thời, sau đó tải lên Cloudinary:

```typescript
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Cấu hình SDK Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình bộ nhớ tạm thời bằng Multer (lưu dạng Buffer)
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

// Helper để upload file buffer lên Cloudinary
export async function uploadToCloudinary(fileBuffer: Buffer, folder: string = "products"): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        return reject(new Error("Upload thất bại không rõ nguyên nhân"));
      }
    );
    uploadStream.end(fileBuffer);
  });
}
```

---

## 6. Viết Route Express kết hợp cả hai (`server.ts`)

Dưới đây là API Route cho phép Admin đăng tải sản phẩm mới kèm theo ảnh thực tế lên Cloudinary và lưu thông tin vào MongoDB:

```typescript
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db';
import Product from './src/models/Product';
import { upload, uploadToCloudinary } from './src/config/cloudinary';

dotenv.config();

const app = express();
app.use(express.json());

// Khởi chạy kết nối Database
connectDB();

// API: Tạo sản phẩm mới kèm Upload ảnh
app.post('/api/products', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, price, category, description, specs } = req.body;
    let imageUrl = '';

    // 1. Kiểm tra và tải ảnh lên Cloudinary nếu có file được upload
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "techvie_products");
    } else {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp hình ảnh sản phẩm.' });
    }

    // Parse thông số kĩ thuật (specs nhận từ Form-data có thể là string JSON)
    let parsedSpecs = [];
    if (specs) {
      parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
    }

    // 2. Lưu thông tin vào MongoDB
    const newProduct = new Product({
      name,
      price: Number(price),
      category,
      description,
      image: imageUrl, // URL nhận từ Cloudinary
      specs: parsedSpecs
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Sản phẩm đã được lưu trữ thành công trên MongoDB & Cloudinary!',
      product: newProduct
    });
  } catch (error: any) {
    console.error('Lỗi khi đăng sản phẩm:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
```

---
> [!NOTE]
> Khi gửi yêu cầu từ Frontend (ví dụ bằng `Axios` hoặc `Fetch`), bạn cần sử dụng đối tượng `FormData` thay vì JSON thông thường để có thể gửi file nhị phân kèm theo các trường thông tin văn bản.
