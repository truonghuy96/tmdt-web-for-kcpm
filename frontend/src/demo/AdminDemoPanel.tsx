import React, { useState, useRef, useEffect } from 'react';
import { Key, ChevronRight, RefreshCw, Layers, ShoppingBag, Trash2 } from 'lucide-react';
import { createProduct, clearAllOrdersFromServer, deleteProduct, getProducts, API_BASE_URL } from '../services/api';
import CustomAlert from '../components/CustomAlert';

interface AdminDemoPanelProps {
  token: string;
  onSwitchAccount: (email: string) => void;
  onRefreshProducts: () => void;
  onRefreshOrders: () => void;
}

export default function AdminDemoPanel({
  token,
  onSwitchAccount,
  onRefreshProducts,
  onRefreshOrders,
}: AdminDemoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isClearingOrders, setIsClearingOrders] = useState(false);
  const [isClearingProducts, setIsClearingProducts] = useState(false);
  const [mockProductCount, setMockProductCount] = useState<number>(100);

  // Custom alert configuration
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleClearOrdersAction = async () => {
    setIsClearingOrders(true);
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
    try {
      const res = await clearAllOrdersFromServer();
      if (res.success) {
        console.log("Đã xóa sạch tất cả đơn hàng thành công!");
        onRefreshOrders();
      } else {
        console.log("Xóa đơn hàng thất bại: " + res.message);
      }
    } catch (err) {
      console.error(err);
      console.log("Lỗi kết nối khi dọn sạch đơn hàng!");
    } finally {
      setIsClearingOrders(false);
    }
  };

  const handleClearOrders = () => {
    setAlertConfig({
      isOpen: true,
      title: "Dọn sạch đơn hàng",
      message: "Bạn có chắc chắn muốn xóa sạch toàn bộ lịch sử đơn hàng trên hệ thống?",
      onConfirm: handleClearOrdersAction,
    });
  };

  const handleCreateMockOrder = async () => {
    setIsCreatingOrder(true);
    try {
      // Lấy danh sách sản phẩm thật trên hệ thống (hoặc fallback từ products data_mockdata)
      const res = await getProducts();
      let availableProducts = res.success && res.products ? res.products : [];
      if (!availableProducts || availableProducts.length === 0) {
        const { products } = await import('./data_mockdata');
        availableProducts = products;
      }

      // Lựa chọn ngẫu nhiên từ 1 đến 3 sản phẩm thật từ danh sách
      const numItems = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, Math.min(numItems, availableProducts.length));

      let calculatedTotal = 0;
      const cartItems = selectedProducts.map((prod) => {
        const quantity = Math.floor(Math.random() * 2) + 1;
        calculatedTotal += prod.price * quantity;
        return {
          product: {
            id: prod.id,
            name: prod.name,
            price: prod.price,
            image: prod.image,
            category: prod.category,
            stock: prod.stock,
            description: prod.description,
            specs: prod.specs || []
          },
          quantity: quantity
        };
      });

      const mockOrderPayload = {
        fullName: "ĐỘ XUM XUÊ (Khách Demo)",
        phone: "0987654321",
        email: "customer@techvie.com",
        address: "180 Cao Lỗ, Quận 8, TP.HCM",
        notes: "Đơn hàng thử nghiệm tạo từ sản phẩm có sẵn trong hệ thống",
        paymentMethod: "cod",
        deliveryMethod: "standard",
        cart: cartItems,
        finalTotal: calculatedTotal.toString()
      };

      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockOrderPayload)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log("Đơn hàng thử nghiệm từ sản phẩm thực tế đã được tạo thành công!");
        onRefreshOrders();
      } else {
        console.log("Tạo đơn hàng thất bại: " + (data.message || "Lỗi chưa rõ"));
      }
    } catch (err) {
      console.error(err);
      console.log("Lỗi kết nối khi tạo đơn hàng thử nghiệm!");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleCreateMockProduct = async () => {
    setIsCreatingProduct(true);
    try {
      // 1. Định nghĩa các tập từ khóa để lắp ghép sản phẩm ngẫu nhiên mà không cần hardcode
      const brands = ["TechVie", "Alpha", "Zenith", "Quantum", "Nexus", "Aero", "Apex", "Edge"];
      const modifiers = ["Pro", "Ultra", "Max", "Prime", "Lite", "Studio", "Carbon", "Elite", "X", "One"];
      
      const productTypes = [
        {
          category: "Điện thoại",
          nouns: ["Phone", "Mobile", "Pocket", "Cell"],
          basePrice: 12000000,
          priceRange: 20000000,
          specKeys: [
            { label: "Màn hình", values: ["6.1 inch OLED, 120Hz", "6.7 inch Super Retina", "6.9 inch Dynamic AMOLED"] },
            { label: "Vi xử lý", values: ["A18 Bionic", "Snapdragon 8 Gen 3", "Dimensity 9300"] },
            { label: "Bộ nhớ RAM", values: ["8GB LPDDR5X", "12GB RAM", "16GB RAM"] }
          ],
          imageKeywords: ["smartphone", "mobile-phone", "iphone"]
        },
        {
          category: "Laptop",
          nouns: ["Book", "Blade", "ZenBook", "Air", "Workstation"],
          basePrice: 18000000,
          priceRange: 45000000,
          specKeys: [
            { label: "CPU", values: ["Apple M3 Pro", "Intel Core i7 Ultra 7", "AMD Ryzen 7 8840HS"] },
            { label: "Độ phân giải", values: ["3K Liquid Retina", "2.8K OLED 120Hz", "FHD IPS 144Hz"] },
            { label: "Dung lượng SSD", values: ["512GB NVMe PCIE", "1TB SSD Ultra-Fast"] }
          ],
          imageKeywords: ["laptop", "macbook", "notebook"]
        },
        {
          category: "Đồng hồ",
          nouns: ["Watch", "Chronos", "Band", "Wrist", "Fit"],
          basePrice: 3500000,
          priceRange: 15000000,
          specKeys: [
            { label: "Thời lượng pin", values: ["Lên đến 18 giờ", "Khoảng 3 ngày sử dụng", "Tối đa 14 ngày ở chế độ tiết kiệm"] },
            { label: "Cảm biến", values: ["Đo nhịp tim sinh học & SpO2", "Cảm biến ECG chuyên sâu", "Đo độ cao khí áp"] }
          ],
          imageKeywords: ["smartwatch", "apple-watch", "watch"]
        },
        {
          category: "Âm thanh",
          nouns: ["Pods", "Buds", "Headset", "Boombox", "Soundbar"],
          basePrice: 1500000,
          priceRange: 8000000,
          specKeys: [
            { label: "Kết nối không dây", values: ["Bluetooth 5.3 aptX", "Bluetooth 5.2 LDAC"] },
            { label: "Chống ồn", values: ["Chống ồn chủ động ANC 40dB", "Chống ồn Hybird thông minh"] }
          ],
          imageKeywords: ["headphones", "earbuds", "speaker"]
        },
        {
          category: "Bàn phím",
          nouns: ["Board", "Key", "Keyboard", "Deck"],
          basePrice: 1200000,
          priceRange: 4000000,
          specKeys: [
            { label: "Layout", values: ["75% Compact layout", "TKL Tenkeyless", "Full-size 108 keys"] },
            { label: "Switch", values: ["Gateron G Pro Brown", "Cherry MX Red Linear", "Kailh Box White Clicky"] }
          ],
          imageKeywords: ["mechanical-keyboard", "keyboard-keycaps"]
        },
        {
          category: "Combo",
          nouns: ["Workspace Elite Combo", "Studio Setup Combo", "Gaming Extreme Combo", "Creator Premium Combo"],
          basePrice: 2000000,
          priceRange: 6000000,
          specKeys: [
            { label: "Bao gồm", values: ["Bàn phím cơ, Chuột không dây, Lót chuột cỡ lớn", "Đèn LED thanh, Loa bluetooth, Bảng tiêu âm", "Bàn phím, Chuột công thái học, Thớt da trải bàn"] },
            { label: "Kết nối", values: ["Bluetooth 5.1 / 2.4GHz", "Không dây & Có dây"] }
          ],
          imageKeywords: ["workspace", "desk-setup", "office-setup"]
        },
        {
          category: "Phụ kiện",
          nouns: ["Cáp Sạc Nhanh", "Bộ Sạc GaN", "Giá Đỡ Laptop", "Tấm Lót Chuột Da", "Túi Chống Sốc"],
          basePrice: 200000,
          priceRange: 1000000,
          specKeys: [
            { label: "Chất liệu", values: ["Liquid Silicon siêu bền", "Hợp kim nhôm cao cấp", "Da PU nguyên tấm"] },
            { label: "Tính năng", values: ["Sạc nhanh 100W", "Chống nước, Dễ lau chùi", "Gập gọn tiện lợi"] }
          ],
          imageKeywords: ["charger", "cable", "mousepad", "laptop-stand"]
        }
      ];

      const descriptions = [
        "Sản phẩm đột phá tích hợp công nghệ tương lai, mang lại trải nghiệm tối ưu vượt trội cho người dùng.",
        "Thiết kế công thái học đỉnh cao từ chất liệu cao cấp siêu bền bỉ, tôn vinh phong cách sống tinh tế.",
        "Hiệu năng mạnh mẽ đứng đầu phân khúc, sẵn sàng giải quyết mọi tác vụ công việc và giải trí nặng nề nhất.",
        "Thiết bị chính hãng, bảo hành toàn quốc 24 tháng kèm chính sách 1 đổi 1 cực kỳ ưu đãi."
      ];

      const colorsPool = ["Titan Tự Nhiên", "Xám Không Gian", "Bạc Silver", "Xanh Midnight", "Đen Jet Black", "Trắng Ceramic"];

      console.log(`Bắt đầu sinh ngẫu nhiên ${mockProductCount} sản phẩm mẫu gửi lên backend...`);
      let successCount = 0;
      
      // Tạo mảng tác vụ gửi song song (chia thành các batch nhỏ 10 sản phẩm để tránh quá tải server/Cloudinary)
      const batchSize = 10;
      for (let i = 0; i < mockProductCount; i += batchSize) {
        const batchPromises = [];
        
        for (let j = 0; j < batchSize && (i + j) < mockProductCount; j++) {
          const type = productTypes[Math.floor(Math.random() * productTypes.length)];
          const brand = brands[Math.floor(Math.random() * brands.length)];
          const noun = type.nouns[Math.floor(Math.random() * type.nouns.length)];
          const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
          const name = `${brand} ${noun} ${modifier} #${Math.floor(Math.random() * 9000) + 1000}`;
          
          const price = Math.floor(type.basePrice + Math.random() * type.priceRange);
          const stock = Math.floor(Math.random() * 80) + 5; // Tồn kho ngẫu nhiên từ 5 đến 85 chiếc
          const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
          
          // Tạo specs ngẫu nhiên
          const specs = type.specKeys.map(spec => {
            const specVal = spec.values ? spec.values[Math.floor(Math.random() * spec.values.length)] : (spec as any).value;
            return { label: spec.label, value: Array.isArray(specVal) ? specVal[0] : specVal };
          });

          // Chọn ngẫu nhiên 2 màu sắc
          const colors = [
            colorsPool[Math.floor(Math.random() * colorsPool.length)],
            colorsPool[(Math.floor(Math.random() * colorsPool.length) + 1) % colorsPool.length]
          ];

          // Lấy ảnh ngẫu nhiên từ Unsplash theo từ khóa category thông qua Source Unsplash
          const keyword = type.imageKeywords[Math.floor(Math.random() * type.imageKeywords.length)];
          const randomPhotoId = Math.floor(Math.random() * 1000);
          const imageUrl = `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&sig=${randomPhotoId}&search=${keyword}`;

          const formData = new FormData();
          formData.append('name', name);
          formData.append('price', String(price));
          formData.append('stock', String(stock));
          formData.append('category', type.category);
          formData.append('description', desc);
          formData.append('image', imageUrl);
          formData.append('specs', JSON.stringify(specs));
          formData.append('colors', JSON.stringify(colors));

          batchPromises.push(
            createProduct(formData, token).then(res => {
              if (res.success) {
                successCount++;
              }
            }).catch(e => console.error("Lỗi khi tạo sản phẩm hàng loạt:", e))
          );
        }

        // Chờ batch hiện tại hoàn thành trước khi chạy batch tiếp theo
        await Promise.all(batchPromises);
        console.log(`Đang chạy... Đã tạo thành công ${successCount}/${Math.min(mockProductCount, i + batchPromises.length)} sản phẩm mẫu.`);
      }

      console.log(`✔ Hoàn thành! Đã tạo thành công tổng cộng ${successCount}/${mockProductCount} sản phẩm mẫu.`);
      onRefreshProducts();
    } catch (err) {
      console.error(err);
      console.log("Lỗi kết nối khi tạo sản phẩm mẫu hàng loạt!");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleClearProductsAction = async () => {
    setIsClearingProducts(true);
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
    try {
      const res = await getProducts();
      if (res.success && res.products) {
        let deletedCount = 0;
        for (const p of res.products) {
          const delRes = await deleteProduct(p.id, token);
          if (delRes.success) {
            deletedCount++;
          }
        }
        console.log(`Đã xóa sạch ${deletedCount}/${res.products.length} sản phẩm thành công!`);
        onRefreshProducts();
      } else {
        console.log("Không lấy được danh sách sản phẩm để xóa.");
      }
    } catch (err) {
      console.error(err);
      console.log("Lỗi kết nối khi dọn sạch sản phẩm!");
    } finally {
      setIsClearingProducts(false);
    }
  };

  const handleClearProducts = () => {
    setAlertConfig({
      isOpen: true,
      title: "Xóa sạch sản phẩm",
      message: "Bạn có chắc chắn muốn xóa sạch TOÀN BỘ sản phẩm trên hệ thống?",
      onConfirm: handleClearProductsAction,
    });
  };

  const handleSwitchToClient = async () => {
    setIsSwitching(true);
    onSwitchAccount("customer@techvie.com");
  };

  return (
    <div
      ref={panelRef}
      className={`fixed right-0 top-[25%] z-[9999] flex items-center transition-transform duration-500 ease-out select-none ${
        isOpen
          ? "translate-x-0"
          : "translate-x-[220px]"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/90 hover:bg-black text-white p-3 rounded-l-2xl border-y border-l border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all cursor-pointer hover:pl-4 group"
      >
        <ChevronRight
          size={16}
          className={`transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}
        />
      </button>

      <div className="w-[220px] bg-black/95 border-l border-y border-white/10 rounded-l-2xl p-4 flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex items-center gap-2 pb-1 border-b border-white/10">
          <Layers size={14} className="text-white" />
          <span className="text-[11px] font-black uppercase tracking-wider text-white font-jakarta">
            Demo Control Panel
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/50 block font-jakarta">
            Dữ liệu Đơn hàng
          </span>
          <button
            type="button"
            onClick={handleCreateMockOrder}
            disabled={isCreatingOrder}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600/30 hover:bg-indigo-600/45 disabled:bg-gray-700/50 text-indigo-200 border border-indigo-500/20 py-2.5 rounded-xl text-[10.5px] font-bold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta"
          >
            {isCreatingOrder ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <ShoppingBag size={12} />
            )}
            TẠO ĐƠN HÀNG MẪU
          </button>

          <div className="relative group/tooltip">
            <button
              type="button"
              onClick={handleClearOrders}
              disabled={isClearingOrders}
              className="w-full flex items-center justify-center gap-2 bg-rose-600/30 hover:bg-rose-600/45 disabled:bg-gray-700/50 text-rose-200 border border-rose-500/20 py-2.5 rounded-xl text-[10.5px] font-bold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta mt-1.5"
            >
              {isClearingOrders ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              XÓA SẠCH ĐƠN HÀNG
            </button>

            {/* Tooltip cảnh báo xóa mềm */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-80 p-3 bg-neutral-950/95 border border-amber-500/40 rounded-xl shadow-2xl backdrop-blur-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-[10000]">
              <p className="text-[11px] leading-relaxed text-amber-200/90 font-medium">
                ⚠️ <strong className="text-amber-400 font-semibold">Lưu ý:</strong>
                <span className="block mt-1">
                  Thao tác này là <span className="underline font-bold text-white">xóa mềm</span> (soft delete). Đơn hàng sẽ được chuyển trạng thái ẩn chứ không mất hoàn toàn trong Database.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/50 block font-jakarta">
            Dữ liệu Kho hàng
          </span>
          {/* Custom Input for mock product count */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 mb-1">
            <span className="text-[9.5px] font-bold text-white/55 font-jakarta">SL:</span>
            <input
              type="number"
              min={1}
              max={500}
              value={mockProductCount}
              onChange={(e) => setMockProductCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-transparent border-0 p-0 text-[11px] font-bold text-white font-mono focus:outline-none focus:ring-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateMockProduct}
            disabled={isCreatingProduct}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/45 disabled:bg-gray-700/50 text-emerald-200 border border-emerald-500/20 py-2.5 rounded-xl text-[10.5px] font-bold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta"
          >
            {isCreatingProduct ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Layers size={12} />
            )}
            TẠO SẢN PHẨM MẪU
          </button>

          <div className="relative group/tooltip">
            <button
              type="button"
              onClick={handleClearProducts}
              disabled={isClearingProducts}
              className="w-full flex items-center justify-center gap-2 bg-rose-600/30 hover:bg-rose-600/45 disabled:bg-gray-700/50 text-rose-200 border border-rose-500/20 py-2.5 rounded-xl text-[10.5px] font-bold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta mt-1.5"
            >
              {isClearingProducts ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              XÓA SẠCH SẢN PHẨM
            </button>

            {/* Tooltip cảnh báo xóa mềm */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-80 p-3 bg-neutral-950/95 border border-amber-500/40 rounded-xl shadow-2xl backdrop-blur-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-[10000]">
              <p className="text-[11px] leading-relaxed text-amber-200/90 font-medium">
                ⚠️ <strong className="text-amber-400 font-semibold">Lưu ý:</strong>
                <span className="block mt-1">
                  Thao tác này là <span className="underline font-bold text-white">xóa mềm</span> (soft delete). Sản phẩm chỉ ẩn khỏi giao diện bán hàng chứ không mất hoàn toàn trong Database.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-white/10">
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/50 block font-jakarta">
            Thay Đổi Phân Quyền
          </span>
          <button
            type="button"
            onClick={handleSwitchToClient}
            disabled={isSwitching}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:bg-gray-700/50 text-white border border-white/10 py-2.5 rounded-xl text-[10.5px] font-bold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta"
          >
            {isSwitching ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Key size={12} />
            )}
            VỀ TÀI KHOẢN KHÁCH
          </button>
        </div>
      </div>

      <CustomAlert
        isOpen={alertConfig.isOpen}
        type="warning"
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        confirmText="Xác nhận"
        cancelText="Hủy bỏ"
        isDarkMode={true}
      />
    </div>
  );
}
