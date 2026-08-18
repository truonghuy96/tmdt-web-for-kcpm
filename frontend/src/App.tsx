import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError } from './utils/toast';
import { TabType, CartItem, Product } from "./types";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getSystemUsers,
  adminCreateUser,
  toggleUserRole,
  toggleUserVip,
  toggleUserStatus,
  adminDeleteUser,
  restoreProduct,
  restoreUser,
  getCurrentUser,
  API_BASE_URL,
} from "./services/api";
import HomePage from "./components/HomePage";
import BrandPage from "./components/BrandPage";
import ProductPage from "./components/ProductPage";
import NewsPage from "./components/NewsPage";
import ContactPage from "./components/ContactPage";
import CheckoutPage from "./components/CheckoutPage";
import AccountPage from "./components/AccountPage";
import AuthPage from "./components/AuthPage";
import AdminPage from "./components/AdminPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SearchSidePanel from "./components/SearchSidePanel";
import PolicyPage from "./components/PolicyPage";
import CartSidePanel from "./components/CartSidePanel";
import ResetPassword from "./components/AuthPage/ResetPassword";
import ProductDetail from "./components/ProductPage/ProductDetail";
import BackToTopButton from "./components/shared/BackToTopButton";

function AppContent() {
  const appRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (pathname: string): TabType => {
    const path = pathname.replace(/^\//, '');
    if (!path) return "home";
    return path as TabType;
  };
  const activeTab = getActiveTab(location.pathname);

  const handleNavigate = (tab: any) => {
    if (tab === "home") {
      navigate("/");
    } else {
      navigate(`/${tab}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const [products, setProducts] = useState<Product[]>([]);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [token, setToken] = useState<string>(
    localStorage.getItem("techvie_token") || "",
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("techvie_token"),
  );
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    memberSince: "",
    techvieId: "",
    shieldStatus: "Standard",
    role: "user",
    authProvider: "credentials",
    isEmailVerified: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const verified = params.get("verified");

    if (verified === "true") {
      showSuccess("Xác thực địa chỉ email thành công!", { icon: "✉️" });
      localStorage.setItem("active_tab", "account");
      handleNavigate("account");
      navigate(location.pathname, { replace: true });
    }

    // Chỉ đánh chặn token đăng nhập nếu KHÔNG ở trang đặt lại mật khẩu (/reset-password)
    if (urlToken && window.location.pathname !== "/reset-password") {
      localStorage.setItem("techvie_token", urlToken);
      localStorage.setItem("active_tab", "account");
      setToken(urlToken);
      setIsLoggedIn(true);
      handleNavigate("account");
      // Clean query params in the URL bar
      navigate(location.pathname, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (token && isLoggedIn) {
      getCurrentUser(token).then((res) => {
        if (res.success && res.user) {
          setUserProfile({
            name: res.user.username || "",
            email: res.user.email || "",
            phone: res.user.phone || "",
            address: res.user.address || "",
            memberSince: res.user.created_at ? new Date(res.user.created_at).toLocaleDateString("vi-VN") : "",
            techvieId: `TV-${(res.user._id || res.user.id || "").substring(0, 6).toUpperCase()}`,
            shieldStatus: res.user.vipStatus === "Premium" ? "Đang Kích Hoạt (Premium)" : (res.user.vipStatus || "Standard"),
            role: res.user.role || "user",
            authProvider: res.user.auth_provider || "credentials",
            isEmailVerified: res.user.isEmailVerified || false,
          });
        } else {
          // Token không hợp lệ hoặc tài khoản đã bị xóa (ví dụ sau khi seed lại database)
          handleSetIsLoggedIn(false);
          showError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      });
    }
  }, [token, isLoggedIn]);

  // Tự động chuyển về trang chủ nếu không phải admin nhưng activeTab là admin
  useEffect(() => {
    if (activeTab === "admin" && (!isLoggedIn || userProfile.role !== "admin")) {
      handleNavigate("home");
    }
  }, [activeTab, isLoggedIn, userProfile.role]);

  useEffect(() => {
    getProducts().then((res) => {
      if (res.success) {
        setProducts(res.products);
      }
    });
  }, []);

  const [globalSelectedProduct, setGlobalSelectedProduct] = useState<Product | null>(null);

  // Monitor url query parameters globally to trigger product details modal overlay
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId') || params.get('id');
    if (productId && products.length > 0) {
      const prod = products.find(p => String(p.id) === String(productId) || String(p._id) === String(productId));
      if (prod) {
        setGlobalSelectedProduct(prod);
      } else {
        setGlobalSelectedProduct(null);
      }
    } else {
      setGlobalSelectedProduct(null);
    }
  }, [location.search, products]);

  const handleCloseGlobalDetail = () => {
    setGlobalSelectedProduct(null);
    const params = new URLSearchParams(location.search);
    params.delete('productId');
    params.delete('id');
    const searchStr = params.toString();
    navigate(location.pathname + (searchStr ? `?${searchStr}` : ''), { replace: true });
  };

  useEffect(() => {
    if (isLoggedIn && userProfile.role === "admin" && token) {
      getSystemUsers(token).then((res) => {
        if (res.success && res.users) {
          const mapped = res.users.map((u: any) => ({
            id: u.id || u._id,
            name: u.username,
            email: u.email,
            phone: u.phone,
            role: u.role,
            vipStatus: u.vipStatus,
            status: u.status,
            joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
          }));
          setSystemUsers(mapped);
        }
      });
    } else {
      setSystemUsers([]);
    }
  }, [isLoggedIn, userProfile.role, token]);


  const handleSetIsLoggedIn = (val: boolean) => {
    setIsLoggedIn(val);
    if (!val) {
      setToken("");
      localStorage.removeItem("techvie_token");
      setUserProfile({
        name: "",
        email: "",
        phone: "",
        address: "",
        memberSince: "",
        techvieId: "",
        shieldStatus: "Standard",
        role: "user",
        authProvider: "credentials",
        isEmailVerified: false,
      });
    }
  };

  const handleQuickSwitchAccount = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: email === "admin@techvie.com" ? "admin123" : "123456" }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem("techvie_token", data.token);
        setIsLoggedIn(true);
        const isSystemAdmin = email === "admin@techvie.com";
        setUserProfile({
          name: isSystemAdmin ? "ADMINISTRATOR" : email.split("@")[0].toUpperCase(),
          email: email,
          phone: "",
          address: "",
          memberSince: "17-06-2026",
          techvieId: `TV-${(data.token || "").substring(10, 16).toUpperCase()}`,
          shieldStatus: "Standard",
          role: isSystemAdmin ? "admin" : "user",
          authProvider: "credentials",
          isEmailVerified: false,
        });
        handleNavigate(isSystemAdmin ? "admin" : "account");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Lỗi quick switch account:", err);
    }
  };

  const handleAddProduct = async (newProduct: any, imageFile: File | null) => {
    try {
      console.log("=== BẮT ĐẦU THÊM SẢN PHẨM MỚI ===");
      console.log("Dữ liệu thô:", newProduct);
      if (imageFile) {
        console.log(
          "Tải kèm tệp ảnh:",
          imageFile.name,
          `(${imageFile.size} bytes)`,
        );
      }

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", String(newProduct.price));
      formData.append("stock", String(newProduct.stock ?? 0));
      formData.append("category", newProduct.category);
      formData.append("description", newProduct.description || "");
      formData.append("specs", JSON.stringify(newProduct.specs || []));
      if (imageFile) {
        formData.append("imageFile", imageFile);
      } else if (newProduct.image) {
        formData.append("image", newProduct.image);
      }

      const res = await createProduct(formData, token);
      if (res.success && res.product) {
        const added = {
          id: res.product.id || (res.product as any)._id,
          name: res.product.name,
          price: res.product.price,
          stock: res.product.stock ?? newProduct.stock,
          category: res.product.category,
          image: res.product.image || newProduct.image,
          description: res.product.description,
          specs: res.product.specs || [],
        };
        console.log(
          "Thêm sản phẩm thành công vào state React! Sản phẩm:",
          added,
        );
        setProducts((prev) => [added, ...prev]);
        showSuccess("Đăng bán sản phẩm thành công!");
      } else {
        console.error(
          "Lỗi phản hồi từ backend khi thêm sản phẩm:",
          res.message,
        );
        showError(`Lỗi khi thêm sản phẩm: ${res.message}`);
      }
    } catch (error: any) {
      console.error("Lỗi thêm sản phẩm:", error);
      showError("Không thể thêm sản phẩm, vui lòng kiểm tra kết nối.");
    }
  };

  const handleEditProduct = async (
    editedProduct: any,
    imageFile: File | null,
  ) => {
    try {
      console.log(`=== BẮT ĐẦU CẬP NHẬT SẢN PHẨM #${editedProduct.id} ===`);
      console.log("Dữ liệu cập nhật mới:", editedProduct);
      if (imageFile) {
        console.log(
          "Tải kèm tệp ảnh mới:",
          imageFile.name,
          `(${imageFile.size} bytes)`,
        );
      }

      const formData = new FormData();
      formData.append("name", editedProduct.name);
      formData.append("price", String(editedProduct.price));
      formData.append("stock", String(editedProduct.stock ?? 0));
      formData.append("category", editedProduct.category);
      formData.append("description", editedProduct.description || "");
      formData.append("specs", JSON.stringify(editedProduct.specs || []));
      if (imageFile) {
        formData.append("imageFile", imageFile);
      } else if (editedProduct.image) {
        formData.append("image", editedProduct.image);
      }

      const res = await updateProduct(editedProduct.id, formData, token);
      if (res.success && res.product) {
        const updated = {
          id: res.product.id || (res.product as any)._id,
          name: res.product.name,
          price: res.product.price,
          stock: res.product.stock ?? editedProduct.stock,
          category: res.product.category,
          image: res.product.image || editedProduct.image,
          description: res.product.description,
          specs: res.product.specs || [],
        };
        console.log(
          "Cập nhật sản phẩm thành công trong state React! Sản phẩm:",
          updated,
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        showSuccess("Cập nhật thông tin sản phẩm thành công!");
      } else {
        console.error("Cập nhật thất bại:", res.message);
        showError(`Lỗi cập nhật sản phẩm: ${res.message}`);
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật sản phẩm:", error);
      showError("Không thể cập nhật sản phẩm, vui lòng kiểm tra mạng.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log(`=== BẮT ĐẦU XÓA SẢN PHẨM #${productId} ===`);
      const res = await deleteProduct(productId, token);
      if (res.success) {
        console.log(`Xóa sản phẩm #${productId} thành công khỏi state React.`);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showSuccess("Xóa sản phẩm thành công!");
      } else {
        console.error("Lỗi phản hồi từ backend khi xóa sản phẩm:", res.message);
        showError(`Lỗi khi xóa sản phẩm: ${res.message}`);
      }
    } catch (error: any) {
      console.error("Lỗi xóa sản phẩm:", error);
      showError("Không thể xóa sản phẩm, vui lòng kiểm tra kết nối.");
    }
  };

  const handleRestoreProduct = async (productId: string) => {
    try {
      const res = await restoreProduct(productId, token);
      if (res.success) {
        // Refresh products to get the restored product with its details
        getProducts().then((data) => {
          if (data.success) setProducts(data.products);
        });
        showSuccess("Khôi phục sản phẩm thành công!");
        return { success: true, message: res.message };
      }
      showError(`Lỗi khôi phục: ${res.message}`);
      return { success: false, message: res.message };
    } catch (error: any) {
      showError("Lỗi kết nối khi khôi phục sản phẩm.");
      return { success: false, message: "Lỗi kết nối khi khôi phục sản phẩm." };
    }
  };

  // User Management Admin Handlers
  const handleAddUser = async (newUser: any) => {
    try {
      const payload = {
        username: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        vipStatus: newUser.vipStatus,
      };
      const res = await adminCreateUser(payload, token);
      if (res.success && res.user) {
        const mappedUser = {
          id: res.user.id || res.user._id,
          name: res.user.username,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          vipStatus: res.user.vipStatus,
          status: res.user.status,
          joinedDate: res.user && res.user.created_at ? new Date(res.user.created_at).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
        };
        setSystemUsers((prev) => [mappedUser, ...prev]);
        return { success: true, message: res.message, user: mappedUser };
      }
      return { success: false, message: res.message || "Lỗi từ máy chủ." };
    } catch (error: any) {
      console.error("Lỗi thêm thành viên:", error);
      return { success: false, message: "Lỗi kết nối khi thêm thành viên." };
    }
  };

  const handleToggleUserRole = async (id: string) => {
    try {
      const res = await toggleUserRole(id, token);
      if (res.success && res.user) {
        const mappedUser = {
          id: res.user.id || res.user._id,
          name: res.user.username,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          vipStatus: res.user.vipStatus,
          status: res.user.status,
          joinedDate: res.user && res.user.created_at ? new Date(res.user.created_at).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
        };
        setSystemUsers((prev) =>
          prev.map((u) => (u.id === id ? mappedUser : u)),
        );
        return { success: true, message: res.message, user: mappedUser };
      }
      return { success: false, message: res.message || "Lỗi kết nối." };
    } catch (error: any) {
      console.error("Lỗi đổi quyền thành viên:", error);
      return { success: false, message: "Lỗi kết nối mạng." };
    }
  };

  const handleToggleUserVip = async (id: string) => {
    try {
      const res = await toggleUserVip(id, token);
      if (res.success && res.user) {
        const mappedUser = {
          id: res.user.id || res.user._id,
          name: res.user.username,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          vipStatus: res.user.vipStatus,
          status: res.user.status,
          joinedDate: res.user && res.user.created_at ? new Date(res.user.created_at).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
        };
        setSystemUsers((prev) =>
          prev.map((u) => (u.id === id ? mappedUser : u)),
        );
        return { success: true, message: res.message, user: mappedUser };
      }
      return { success: false, message: res.message || "Lỗi kết nối." };
    } catch (error: any) {
      console.error("Lỗi đổi VIP thành viên:", error);
      return { success: false, message: "Lỗi kết nối mạng." };
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    try {
      const res = await toggleUserStatus(id, token);
      if (res.success && res.user) {
        const mappedUser = {
          id: res.user.id || res.user._id,
          name: res.user.username,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          vipStatus: res.user.vipStatus,
          status: res.user.status,
          joinedDate: res.user && res.user.created_at ? new Date(res.user.created_at).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
        };
        setSystemUsers((prev) =>
          prev.map((u) => (u.id === id ? mappedUser : u)),
        );
        return { success: true, message: res.message, user: mappedUser };
      }
      return { success: false, message: res.message || "Lỗi kết nối." };
    } catch (error: any) {
      console.error("Lỗi đổi trạng thái thành viên:", error);
      return { success: false, message: "Lỗi kết nối mạng." };
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await adminDeleteUser(id, token);
      if (res.success) {
        setSystemUsers((prev) => prev.filter((u) => u.id !== id));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || "Lỗi kết nối." };
    } catch (error: any) {
      console.error("Lỗi xóa thành viên:", error);
      return { success: false, message: "Lỗi kết nối mạng." };
    }
  };

  const handleRestoreUser = async (id: string) => {
    try {
      const res = await restoreUser(id, token);
      if (res.success) {
        // Refresh users to get the restored user with its details
        getSystemUsers(token).then((data) => {
          if (data.success && data.users) {
            const mapped = data.users.map((u: any) => ({
              id: u.id || u._id,
              name: u.username,
              email: u.email,
              phone: u.phone,
              role: u.role,
              vipStatus: u.vipStatus,
              status: u.status,
              joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
            }));
            setSystemUsers(mapped);
          }
        });
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (error: any) {
      return { success: false, message: "Lỗi kết nối mạng." };
    }
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("techvie_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("techvie_cart", JSON.stringify(cart));
  }, [cart]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cart operations
  const handleAddToCart = (product: Product, selectedColor?: string) => {
    setCart((prevCart) => {
      // Phân biệt cart item theo cả productId lẫn selectedColor
      const existing = prevCart.find(
        (item) => item.product.id === product.id && item.selectedColor === selectedColor
      );
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { product, quantity: 1, selectedColor }];
    });
    const colorNote = selectedColor ? ` (${selectedColor})` : '';
    showSuccess(`Đã thêm ${product.name}${colorNote} vào giỏ hàng`, { position: "top-center", duration: 3000 });
    // Open cart drawer so customer enjoys the feedback
    setIsCartOpen(true);
  };

  const handleQuantityChange = (productId: string, delta: number, selectedColor?: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId && item.selectedColor === selectedColor) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (productId: string, selectedColor?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.selectedColor === selectedColor)
      ),
    );
  };

  const handleUpdateItemColor = (productId: string, oldColor?: string, newColor?: string) => {
    setCart((prevCart) => {
      const targetIndex = prevCart.findIndex(
        (item) => item.product.id === productId && item.selectedColor === oldColor
      );
      if (targetIndex === -1) return prevCart;

      const targetItem = prevCart[targetIndex];
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === productId && item.selectedColor === newColor
      );

      if (existingIndex !== -1 && existingIndex !== targetIndex) {
        return prevCart
          .map((item, idx) => {
            if (idx === existingIndex) {
              return { ...item, quantity: item.quantity + targetItem.quantity };
            }
            return item;
          })
          .filter((_, idx) => idx !== targetIndex);
      } else {
        return prevCart.map((item, idx) =>
          idx === targetIndex ? { ...item, selectedColor: newColor } : item
        );
      }
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const showHeaderFooter =
    activeTab !== "login" &&
    activeTab !== "register" &&
    !String(activeTab).startsWith("admin") &&
    activeTab !== "reset-password";

  const navigationItems: { id: TabType; label: string }[] = [
    { id: "home", label: "TRANG CHỦ" },
    { id: "products", label: "SẢN PHẨM" },
    { id: "brand", label: "THƯƠNG HIỆU" }, // The requested brand page
    { id: "news", label: "TIN TỨC" },
    { id: "policy", label: "CHÍNH SÁCH" },
    { id: "contact", label: "LIÊN HỆ" },
  ];

  return (
    <div
      ref={appRef}
      className="min-h-screen bg-[#f7f9fb] text-gray-900 font-sans flex flex-col justify-between selection:bg-black selection:text-white relative"
    >
      <Toaster 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }} 
      />
      {/* Aurora Ambient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] animate-drift-slow" />
        <div className="absolute bottom-[-100px] right-[-50px] w-[500px] h-[500px] rounded-full bg-rose-500/5 blur-[120px] animate-drift-medium" />
      </div>

      {/* Primary Global Navigation */}
      {showHeaderFooter && (
        <Header
          activeTab={activeTab}
          setActiveTab={handleNavigate}
          navigationItems={navigationItems}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          totalCartCount={totalCartCount}
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      )}

      {/* Interactive Main Body Swap Grid */}
      <main
        className={
          showHeaderFooter
            ? "flex-grow"
            : "min-h-screen flex items-center justify-center p-0 w-full"
        }
      >
        <AnimatePresence mode="wait">
          <Routes 
            location={location} 
            key={location.pathname.startsWith('/admin') ? '/admin' : location.pathname}
          >
            <Route path="/" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <HomePage products={products} onNavigate={handleNavigate} onAddToCart={handleAddToCart} isLoggedIn={isLoggedIn} userEmail={userProfile.email} userProfile={userProfile} />
              </motion.div>
            } />
            <Route path="/brand" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <BrandPage />
              </motion.div>
            } />
            <Route path="/products" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <ProductPage products={products} onAddToCart={handleAddToCart} onNavigate={handleNavigate} />
              </motion.div>
            } />
            <Route path="/news" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <NewsPage />
              </motion.div>
            } />
            <Route path="/contact" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <ContactPage />
              </motion.div>
            } />
            <Route path="/policy" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <PolicyPage />
              </motion.div>
            } />
            <Route path="/checkout" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <CheckoutPage cart={cart} onQuantityChange={handleQuantityChange} onRemoveItem={handleRemoveItem} onClearCart={handleClearCart} isLoggedIn={isLoggedIn} userProfile={userProfile} onNavigate={handleNavigate} />
              </motion.div>
            } />
            <Route path="/login" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <AuthPage initialMode="login" onNavigate={handleNavigate} onLoginSuccess={(email, userToken) => {
                  const isSystemAdmin = email === "admin@techvie.com";
                  if (userToken) {
                    setToken(userToken);
                    localStorage.setItem("techvie_token", userToken);
                  }
                  setUserProfile((prev) => ({
                    ...prev,
                    email: email,
                    name: isSystemAdmin ? "ADMINISTRATOR" : email.split("@")[0].toUpperCase(),
                    role: isSystemAdmin ? "admin" : "user",
                  }));
                  setIsLoggedIn(true);
                  if (isSystemAdmin) {
                    handleNavigate("admin");
                    showSuccess("Đăng nhập Admin thành công", { icon: "👑" });
                  } else {
                    handleNavigate("account");
                    showSuccess(`Chào mừng ${email.split("@")[0].toUpperCase()} quay trở lại!`);
                  }
                }} onRegisterSuccess={(email, name, userToken) => {
                  if (userToken) {
                    setToken(userToken);
                    localStorage.setItem("techvie_token", userToken);
                  }
                  setUserProfile((prev) => ({
                    ...prev,
                    email: email,
                    name: name,
                    role: "user",
                  }));
                  setIsLoggedIn(true);
                  handleNavigate("account");
                  showSuccess(`Đăng ký thành công! Chào mừng ${name}.`);
                }} />
              </motion.div>
            } />
            <Route path="/register" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <AuthPage initialMode="register" onNavigate={handleNavigate} onLoginSuccess={(email, userToken) => {
                  const isSystemAdmin = email === "admin@techvie.com";
                  if (userToken) {
                    setToken(userToken);
                    localStorage.setItem("techvie_token", userToken);
                  }
                  setUserProfile((prev) => ({
                    ...prev,
                    email: email,
                    name: isSystemAdmin ? "ADMINISTRATOR" : email.split("@")[0].toUpperCase(),
                    role: isSystemAdmin ? "admin" : "user",
                  }));
                  setIsLoggedIn(true);
                  if (isSystemAdmin) {
                    handleNavigate("admin");
                    showSuccess("Đăng nhập Admin thành công", { icon: "👑" });
                  } else {
                    handleNavigate("account");
                    showSuccess(`Chào mừng ${email.split("@")[0].toUpperCase()} quay trở lại!`);
                  }
                }} onRegisterSuccess={(email, name, userToken) => {
                  if (userToken) {
                    setToken(userToken);
                    localStorage.setItem("techvie_token", userToken);
                  }
                  setUserProfile((prev) => ({
                    ...prev,
                    email: email,
                    name: name,
                    role: "user",
                  }));
                  setIsLoggedIn(true);
                  handleNavigate("account");
                  showSuccess(`Đăng ký thành công! Chào mừng ${name}.`);
                }} />
              </motion.div>
            } />
            <Route path="/reset-password" element={
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                <ResetPassword token={new URLSearchParams(location.search).get("token") || ""} onNavigate={handleNavigate} />
              </motion.div>
            } />
            <Route path="/account" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="w-full">
                <AccountPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} setIsLoggedIn={handleSetIsLoggedIn} userProfile={userProfile} setUserProfile={setUserProfile} token={token} onAddToCart={handleAddToCart} />
              </motion.div>
            } />
            <Route path="/admin/*" element={
              (token && userProfile.name === "") ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : userProfile.role === "admin" ? (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="w-full">
                  <AdminPage token={token} products={products} onAddProduct={handleAddProduct} onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteProduct} onRestoreProduct={handleRestoreProduct} onNavigate={handleNavigate} systemUsers={systemUsers} onAddUser={handleAddUser} onToggleUserRole={handleToggleUserRole} onToggleUserVip={handleToggleUserVip} onToggleUserStatus={handleToggleUserStatus} onDeleteUser={handleDeleteUser} onRestoreUser={handleRestoreUser} onSwitchAccount={handleQuickSwitchAccount} onRefreshProducts={() => getProducts().then(res => res.success && setProducts(res.products))} />
                </motion.div>
              ) : <Navigate to="/" replace />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Master Website Footer conforming to branding mock directions */}
      {showHeaderFooter && (
        <Footer navigationItems={navigationItems} setActiveTab={handleNavigate} />
      )}

      {/* Left 70%-width Slide out Search panel drawer */}
      <SearchSidePanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onNavigate={(tab) => {
          handleNavigate(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Right Slide-out Cart panel drawer */}
      <CartSidePanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onQuantityChange={handleQuantityChange}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onNavigate={(tab) => {
          handleNavigate(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onUpdateItemColor={handleUpdateItemColor}
      />

      {/* Back to Top Button */}
      <BackToTopButton activeTab={activeTab} />

      {/* Global Product Detail Modal Overlay */}
      <ProductDetail
        product={globalSelectedProduct}
        onClose={handleCloseGlobalDetail}
        onAddToCart={handleAddToCart}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
