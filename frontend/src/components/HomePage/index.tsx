import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Product, TabType } from "../../types";
import {
  ArrowLeftRight,
  Activity,
  Cpu,
  Compass,
  ArrowRight,
  Check,
  Send,
  Plus,
  X,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { subscribeNewsletter, API_BASE_URL, getCheckoutPaymentStatus } from "../../services/api";
import ProductCard from "../ProductPage/ProductCard";
import ProductDetail from "../ProductPage/ProductDetail";
import SloganQuote from "../SloganQuote";
import img_card from "../../assets/images/home-page/home_page_card.png";
import ImageWithFallback from "../shared/ImageWithFallback";
import imagekitAssets from "../../config/imagekitAssets.json";

// Import tất cả ảnh slideshow local động (kể cả file mới thêm mà không cần import cứng từng file)
const localSlideshowModules = import.meta.glob<{ default: string }>(
  "../../assets/slideshow/*.{png,jpg,jpeg,webp,svg}",
  { eager: true }
);
const defaultLocalSlides = Object.values(localSlideshowModules).map((m) => m.default);

// Fallback ảnh mẫu online nếu không tìm thấy file nào
const onlineFallbackSlides = [
  "https://images.unsplash.com/photo-1581063683670-6df2247f1d8e?q=80&w=2080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2080&auto=format&fit=crop",
];

// Helper lấy danh sách ảnh ngẫu nhiên từ slideshow
const getRandomSlideshowImages = (count: number = 5): string[] => {
  const assets = imagekitAssets as Record<string, string>;
  // Lấy tất cả các URL thuộc folder slideshow trong imagekitAssets
  const slideshowUrls = Object.keys(assets)
    .filter((key) => key.startsWith("slideshow/"))
    .map((key) => assets[key]);

  // Gom pool ảnh: ưu tiên URL ImageKit -> local slides -> online fallback
  const pool = Array.from(
    new Set([...slideshowUrls, ...defaultLocalSlides, ...onlineFallbackSlides])
  );

  // Trộn ngẫu nhiên (Fisher-Yates Shuffle)
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};




interface HomePageProps {
  products?: Product[];
  onNavigate: (tab: TabType) => void;
  onAddToCart: (product: Product, selectedColor?: string) => void;
  isLoggedIn?: boolean;
  userEmail?: string;
  userProfile?: any;
}

const normalizeProduct = (p: any): Product => {
  let safeSpecs: { label: string; value: string }[] = [];
  if (Array.isArray(p.specs)) {
    safeSpecs = p.specs.map((s: any) => ({
      label: s && typeof s.label === "string" ? s.label : "Thông số",
      value:
        s && typeof s.value === "string"
          ? s.value
          : typeof s === "string"
            ? s
            : "Đang cập nhật",
    }));
  } else if (p.specs && typeof p.specs === "object") {
    safeSpecs = Object.entries(p.specs).map(([key, val]) => ({
      label: key,
      value: String(val),
    }));
  }

  while (safeSpecs.length < 2) {
    safeSpecs.push({ label: "Thông số", value: "Đang cập nhật" });
  }

  return {
    id: p.id || p._id || String(Math.random()),
    name: p.name || "Sản phẩm TechVie",
    price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
    image:
      p.image ||
      "https://images.unsplash.com/photo-1581063683670-6df2247f1d8e?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: p.category || "Thiết bị",
    description: p.description || "Mô tả đang được cập nhật.",
    specs: safeSpecs,
    colors: Array.isArray(p.colors)
      ? p.colors
      : typeof p.colors === "string"
        ? p.colors.split(",").map((c: string) => c.trim())
        : [],
    averageRating: typeof p.averageRating === "number" ? p.averageRating : 0,
    reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : 0,
  };
};

export default function HomePage({
  products,
  onNavigate,
  onAddToCart,
  isLoggedIn = false,
  userEmail = "",
  userProfile,
}: HomePageProps) {
  const allProducts = (products || []).map(normalizeProduct);
  const isPremium =
    isLoggedIn &&
    (userProfile?.shieldStatus === "Đang Kích Hoạt (Premium)" ||
      userProfile?.shieldStatus === "Premium");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [showSubscriptionSuccess, setShowSubscriptionSuccess] = useState(
    !!localStorage.getItem("techvie_subscribed"),
  );
  const [isSubmittingSubscription, setIsSubmittingSubscription] =
    useState(false);
  const [isLoadedFromApi, setIsLoadedFromApi] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [magneticRefId, setMagneticRefId] = useState<string | null>(null);
  const [flyingParticles, setFlyingParticles] = useState<
    { id: number; startX: number; startY: number; image: string }[]
  >([]);

  // Payment redirect detection state
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const fetchPaymentStatus = async (orderId: string) => {
    setIsCheckingPayment(true);
    setPaymentError("");
    setPaymentStatusMessage("");
    try {
      const data = await getCheckoutPaymentStatus(orderId);
      if (data.success) {
        setPaymentDetails(data.payment || data.order || null);
        const status = data.payment?.status || data.order?.paymentStatus;
        if (status === 'paid') {
          setPaymentStatusMessage('Đơn hàng đã thanh toán thành công.');
        } else if (status === 'failed') {
          setPaymentStatusMessage('Thanh toán đang được đánh dấu lỗi.');
        } else if (status === 'cancelled') {
          setPaymentStatusMessage('Thanh toán đã bị hủy bỏ.');
        } else {
          setPaymentStatusMessage('Đơn hàng vẫn đang chờ đối soát giao dịch.');
        }
      } else {
        setPaymentError(data.message || "Không thể kiểm tra trạng thái thanh toán lúc này.");
      }
    } catch (err) {
      setPaymentError("Lỗi kết nối đến máy chủ. Vui lòng tải lại trang.");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId") || params.get("order_id");
    if (orderId) {
      setPaymentOrderId(orderId);
      fetchPaymentStatus(orderId);
    }
  }, []);

  const handleRefreshPaymentStatus = () => {
    if (paymentOrderId) {
      fetchPaymentStatus(paymentOrderId);
    }
  };

  const handleClosePaymentModal = () => {
    setPaymentOrderId(null);
    setPaymentDetails(null);
    setPaymentStatusMessage("");
    setPaymentError("");
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  };

  // Scroll reveal — IntersectionObserver
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleAddToCartWithSuccess = (
    product: Product,
    selectedColor?: string,
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (e && typeof e.currentTarget?.getBoundingClientRect === "function") {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      startX = buttonRect.left + buttonRect.width / 2;
      startY = buttonRect.top + buttonRect.height / 2;
    }

    const particleId = Date.now() + Math.random();
    setFlyingParticles((prev) => [
      ...prev,
      {
        id: particleId,
        startX: startX,
        startY: startY,
        image: product.image,
      },
    ]);

    setTimeout(() => {
      setFlyingParticles((prev) => prev.filter((p) => p.id !== particleId));
    }, 950);

    setMagneticRefId(product.id);
    setTimeout(() => {
      setMagneticRefId(null);
    }, 600);

    onAddToCart(product, selectedColor);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 2000);
  };

  const [images, setImages] = useState<string[]>(() => getRandomSlideshowImages(5));



  // Rotating slider effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSubscribe =
      isLoggedIn && userEmail ? userEmail : newsletterEmail;
    if (emailToSubscribe.trim() === "" || isSubmittingSubscription) return;
    setIsSubmittingSubscription(true);
    try {
      const res = await subscribeNewsletter(emailToSubscribe);
      if (res.success) {
        localStorage.setItem("techvie_subscribed", "true");
        setShowSubscriptionSuccess(true);
        setNewsletterEmail("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSubscription(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Slideshow Section */}
      <section className="bg-gray-150 relative h-screen w-full overflow-hidden -mt-18">
        <div className="absolute inset-0 h-full w-full">
          <AnimatePresence>
            <motion.img
              key={images[currentSlide] || currentSlide}
              src={images[currentSlide]}
              alt={`TechVie Slideshow ${currentSlide + 1}`}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/5" />
        </div>

        {/* Ambient Overlay & Radial highlight, matching Vietnamese TechVie presentation card */}
        <div className="md:px-margin-desktop absolute inset-0 z-10 flex items-center justify-start bg-gradient-to-r from-white/35 via-transparent to-black/10 px-6 backdrop-brightness-95">
          <div className="mx-auto flex w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative max-w-2xl rounded-2xl border border-white/60 bg-white/45 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.1)] backdrop-blur-[35px] sm:rounded-3xl sm:p-8 md:p-10 lg:p-14"
            >
              <div className="via-secondary/40 absolute top-1/4 -left-px h-24 w-1 bg-gradient-to-b from-transparent to-transparent"></div>

              <span className="text-secondary mb-4 block text-xs font-bold tracking-[0.25em] uppercase sm:text-sm lg:mb-6">
                <span className="bg-secondary h-2.5 w-2.5 animate-pulse rounded-full"></span>
                PHỤ KIỆN & ĐỒ SETUP AESTHETIC
              </span>

              <h1 className="mb-4 font-sans text-3xl leading-[1.05] font-black tracking-tighter text-gray-900 sm:text-4xl md:text-5xl lg:mb-6 lg:text-6xl">
                Góc Làm Việc <br />
                Đậm Chất Riêng
              </h1>

              <p className="text-gray-650 sm:text-md mb-4 max-w-md text-justify font-sans text-sm leading-relaxed lg:mb-8">
                Khơi nguồn cảm hứng với các combo phụ kiện tiện ích và ốp lưng
                custom độc quyền. TechVie đồng hành cùng bạn kiến tạo góc làm
                việc tối giản, bảo vệ sức khỏe và thể hiện cá tính.
              </p>

              {/* Specification stats box in vietnamese template */}
              <div className="mb-4 grid grid-cols-2 gap-4 py-1 sm:gap-8 lg:mb-8 lg:py-2">
                <div>
                  <div className="mb-1 text-[12px] font-extrabold tracking-widest text-gray-900 uppercase sm:text-[15px]">
                    BẢO HÀNH 1-ĐỔI-1
                  </div>
                  <div className="flex items-baseline gap-1 text-[11px] text-gray-500 sm:text-[13px]">
                    Lỗi từ nhà sản xuất
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[12px] font-extrabold tracking-widest text-gray-900 uppercase sm:text-[15px]">
                    ĐÓNG GÓI GIFT BOX
                  </div>
                  <div className="flex items-baseline gap-1 text-[11px] text-gray-500 sm:text-[13px]">
                    Trải nghiệm unbox khác biệt
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => onNavigate("brand")}
                  className="group relative flex h-16 w-full origin-left cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-neutral-800 p-8 text-right text-base font-bold text-gray-50 shadow-2xl shadow-amber-100 duration-500 before:absolute before:top-1 before:right-1 before:z-10 before:h-12 before:w-12 before:rounded-full before:bg-white/40 before:blur-lg before:duration-500 before:content-[''] group-hover:before:duration-500 after:absolute after:top-3 after:right-8 after:z-10 after:h-20 after:w-20 after:rounded-full after:bg-amber-100 after:blur-lg after:duration-500 after:content-[''] group-hover:after:duration-500 hover:text-white hover:decoration-2 hover:duration-500 hover:before:right-8 hover:before:-bottom-8 hover:before:blur hover:after:-right-6"
                >
                  <span className="relative z-[2] flex items-center gap-2 uppercase transition-all duration-300 group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.8)]">
                    Khám phá thương hiệu
                    <ArrowRight
                      size={24}
                      className="transition-all duration-300 group-hover:translate-x-1.5 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                    />
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Circular progress indicators underneath matching vietnamese design dot indicators */}
        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 space-x-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full border border-black/10 shadow-md transition-all duration-300 ${
                currentSlide === idx
                  ? "w-8 scale-110 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Electronics Collection */}
      <section
        ref={(el) => {
          revealRefs.current[0] = el;
        }}
        className="reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mb-10 flex flex-col items-start justify-between sm:mb-14 sm:flex-row sm:items-end">
          <div>
            <span className="text-secondary mb-3 block text-xs font-bold tracking-[0.3em] uppercase">
              SẢN PHẨM NỔI BẬT
            </span>
            <h2 className="font-sans text-2xl font-extrabold tracking-tighter text-gray-950 sm:text-3xl md:text-5xl">
              Góc Setup Trendy & Tiện Ích
            </h2>
          </div>
          <button
            onClick={() => onNavigate("products")}
            className="border-primary mt-4 cursor-pointer border-b-2 pb-1.5 text-[13px] font-black tracking-[0.3em] uppercase transition-opacity hover:opacity-75 sm:mt-0"
          >
            Gian Trưng Bày
          </button>
        </div>

        {/* Products grid — 1 col xs, 2 col sm, 3 col md+ */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
          {allProducts.slice(0, 3).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.45,
                delay: idx * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProductCard
                product={product}
                onSelect={setSelectedProduct}
                onAddToCart={handleAddToCartWithSuccess}
                isJustAdded={justAddedId === product.id}
                isMagnetized={magneticRefId === product.id}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <SloganQuote />

      {/* Exquisite Brand Promo Card Banner */}
      <section
        ref={(el) => {
          revealRefs.current[1] = el;
        }}
        className="reveal reveal-delay-1 mx-auto mt-24 mb-16 max-w-7xl px-4 sm:mt-40 sm:mb-20 sm:px-6"
      >
        <div className="grid grid-cols-1 items-center gap-12 rounded-[3rem] bg-linear-to-l from-black/5 to-white/90 p-8 md:p-16 lg:grid-cols-2">
          <div>
            <span className="text-secondary mb-3 block text-xs font-bold tracking-[0.3em] uppercase">
              TRẢI NGHIỆM MUA SẮM KHÁC BIỆT
            </span>
            <h2 className="font-sans text-3xl leading-tight font-black tracking-tighter text-gray-950 md:text-5xl">
              Nâng Tầm Cảm Xúc Khi Mở Hộp
            </h2>
            <p className="text-gray-650 text-md mt-6 mb-8 text-justify font-sans leading-relaxed">
              Không chỉ cung cấp phụ kiện, TechVie chú trọng vào trải nghiệm của
              bạn. Mọi sản phẩm đều được kiểm tra kỹ lưỡng (QC 100%) và đóng gói
              dưới dạng hộp quà tặng (Gift box) chỉn chu kèm thiệp viết tay.
            </p>
            <div className="mb-8 flex flex-wrap gap-8 border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3">
                <div className="text-secondary flex h-10 w-15 items-center justify-center rounded-xl">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Đóng Gói Aesthetic
                  </h4>
                  <p className="max-w-xs text-sm text-gray-500">
                    Bao bì chống sốc an toàn, thiết kế tối giản, mang lại sự
                    tinh tế ngay từ cái nhìn đầu tiên
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-secondary flex h-10 w-15 items-center justify-center rounded-xl">
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Dịch Vụ Custom
                  </h4>
                  <p className="max-w-xs text-sm text-gray-500">
                    Hỗ trợ in ấn tên, hình vẽ lên ốp lưng theo yêu cầu để bạn tự
                    do sáng tạo cái tôi độc bản
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onNavigate("brand")}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-black px-8 py-3.5 font-sans text-xs font-black tracking-widest text-white uppercase hover:bg-gray-800"
              >
                TÌM HIỂU THÊM
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-[2rem] shadow shadow-2xl transition-all duration-300 hover:-translate-y-2 lg:aspect-square">
            <img
              src={img_card}
              alt="TechVie Laboratory equipment"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-all"
            />
          </div>
        </div>
      </section>

      {/* Luxurious Newsletter subscription matching modern grid template details */}
      {!isPremium && !showSubscriptionSuccess && (
        <section
          ref={(el) => {
            revealRefs.current[2] = el;
          }}
          className="reveal reveal-delay-2 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-sans text-4xl leading-none font-black tracking-tighter text-gray-950 md:text-5xl">
                Nhận Ưu Đãi <br />
                Độc Quyền
              </h2>
              <p className="text-gray-655 text-md max-w-md text-justify font-sans leading-relaxed">
                Đăng ký email để không bỏ lỡ các mã Freeship, voucher giảm giá
                và thông tin mới nhất về các bộ sưu tập đồ setup từ TechVie.
              </p>
            </div>

            <div>
              <AnimatePresence mode="wait">
                <motion.form
                  key="subscribe-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubscribe}
                  className="flex w-full max-w-md flex-col gap-4"
                >
                  {!isLoggedIn ? (
                    <>
                      <label htmlFor="newsletter-email" className="sr-only">
                        Địa chỉ Email
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        placeholder="email@techvie.com"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                        disabled={isSubmittingSubscription}
                        className="rounded-2xl border border-gray-300 bg-white/50 px-6 py-4 font-sans text-base backdrop-blur-md transition-colors outline-none placeholder:text-gray-400 focus:border-black disabled:opacity-60"
                      />
                    </>
                  ) : (
                    <div className="rounded-2xl border border-gray-200/50 bg-white/40 px-6 py-4 font-sans text-sm text-gray-800 backdrop-blur-md">
                      Đăng ký bằng tài khoản:{" "}
                      <strong className="font-extrabold text-black">
                        {userEmail}
                      </strong>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingSubscription}
                    className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 font-sans text-xs font-black tracking-[0.3em] text-white uppercase transition-transform hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-700"
                  >
                    {isSubmittingSubscription
                      ? "ĐANG GỬI ĐĂNG KÝ..."
                      : "THAM GIA ĐẶC QUYỀN"}
                    {!isSubmittingSubscription && <Send size={14} />}
                  </button>
                </motion.form>
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* Product Detail Specs Modal */}
      <ProductDetail
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCartWithSuccess}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
      />

      {/* Backend Payment Status Modal (Redirected from checkout/product) */}
      <AnimatePresence>
        {paymentOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white/95 border border-gray-150 rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden my-8"
            >
              {/* Specular Highlight */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-white/80 via-white/50 to-transparent" />

              {/* Close Button */}
              <button
                onClick={handleClosePaymentModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-950 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>

              {isCheckingPayment ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs uppercase tracking-widest font-black text-gray-500 font-sans animate-pulse">Đang truy xuất thông tin giao dịch...</p>
                </div>
              ) : paymentError ? (
                <div className="text-center py-6 space-y-4 font-sans">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <AlertCircle size={28} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Truy xuất thất bại</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">{paymentError}</p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={handleRefreshPaymentStatus}
                      className="bg-black hover:bg-neutral-800 text-white py-3 px-6 rounded-xl text-xs uppercase tracking-widest font-black transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw size={14} className="animate-spin-slow" /> Thử lại
                    </button>
                    <button
                      onClick={handleClosePaymentModal}
                      className="bg-gray-105 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl text-xs uppercase tracking-widest font-black transition-all active:scale-95 cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status header */}
                  {(() => {
                    const status = paymentDetails?.status || paymentDetails?.paymentStatus || 'pending';
                    const provider = paymentDetails?.provider || paymentDetails?.paymentProvider || 'cod';
                    const isPaid = status === 'paid';
                    const isWaiting = status !== 'paid' && provider !== 'cod';

                    return (
                      <>
                        <div className="text-center space-y-3">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
                            isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            isWaiting ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                            'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {isPaid ? <CheckCircle2 size={32} className="animate-bounce" /> :
                             isWaiting ? <Clock3 size={32} className="animate-pulse" /> :
                             <XCircle size={32} />}
                          </div>
                          <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                            {isPaid ? 'Thanh toán thành công!' :
                             isWaiting ? 'Đã ghi nhận đơn hàng' :
                             'Giao dịch thất bại'}
                          </h3>
                          <p className="text-xs text-gray-500 max-w-sm mx-auto font-sans leading-relaxed">
                            {paymentStatusMessage || 'Đang chờ đối soát từ hệ thống.'}
                          </p>
                        </div>

                        {/* Bill receipt details */}
                        <div className="border border-gray-150 rounded-2xl p-4 bg-gray-50/50 font-sans text-xs space-y-3">
                          <div className="flex justify-between pb-2 border-b border-gray-200 font-mono text-[9px] text-gray-400">
                            <span>ĐƠN HÀNG #{paymentOrderId.substring(0, 8).toUpperCase()}</span>
                            <span>MÃ ĐỐI SOÁT: {paymentDetails?.paymentReference || paymentDetails?.reference || 'N/A'}</span>
                          </div>

                          <div className="space-y-1.5 py-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-bold uppercase text-[9px]">Khách hàng</span>
                              <span className="font-extrabold text-gray-900">{paymentDetails?.fullName || paymentDetails?.full_name || 'Khách vãng lai'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-bold uppercase text-[9px]">Phương thức</span>
                              <span className="font-bold text-gray-900">
                                {provider === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                                 provider === 'momo' ? 'Ví MoMo' :
                                 provider === 'zalopay' ? 'Ví ZaloPay' :
                                 provider === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Trực tuyến'}
                              </span>
                            </div>
                            {paymentDetails?.finalTotal && (
                              <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span className="text-gray-400 font-bold uppercase text-[9px]">Tổng thanh toán</span>
                                <span className="font-black text-sm text-indigo-700">{paymentDetails.finalTotal}</span>
                              </div>
                            )}
                          </div>

                          {/* Show QR / transfer instructions if pending & online transfer */}
                          {isWaiting && (
                            <div className="pt-3 border-t border-gray-200 text-center space-y-3">
                              <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                                Vui lòng quét mã QR hoặc chuyển khoản đúng nội dung bên dưới để hoàn tất:
                              </p>
                              {provider === 'bank_transfer' && (
                                <div className="max-w-[160px] mx-auto border border-gray-200 rounded-xl overflow-hidden shadow-md">
                                  <img src="/src/assets/images/payment-qr/nganhang.jpg" alt="QR Ngân Hàng" className="w-full h-auto" />
                                </div>
                              )}
                              {provider === 'momo' && (
                                <div className="max-w-[160px] mx-auto border border-gray-200 rounded-xl overflow-hidden shadow-md">
                                  <img src="/src/assets/images/payment-qr/momo.jpg" alt="QR MoMo" className="w-full h-auto" />
                                </div>
                              )}
                              {provider === 'zalopay' && (
                                <div className="max-w-[160px] mx-auto border border-gray-200 rounded-xl overflow-hidden shadow-md">
                                  <img src="/src/assets/images/payment-qr/zalopay.jpg" alt="QR ZaloPay" className="w-full h-auto" />
                                </div>
                              )}
                              <div className="bg-white border border-gray-200 rounded-xl p-2.5 text-left font-mono text-[10px] space-y-1">
                                <div><span className="text-gray-400 font-sans font-bold text-[8px] uppercase block">Lời nhắn/Nội dung CK</span> <strong className="text-black font-extrabold">{paymentDetails?.paymentNote || paymentDetails?.note || 'TECHVIE'}</strong></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* CTA buttons */}
                        <div className="pt-2 flex justify-center gap-3">
                          {isWaiting && (
                            <button
                              onClick={handleRefreshPaymentStatus}
                              className="bg-black hover:bg-neutral-800 text-white py-3 px-6 rounded-xl text-xs uppercase tracking-widest font-black transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                            >
                              <RefreshCw size={14} className={isCheckingPayment ? "animate-spin" : ""} /> Cập nhật trạng thái
                            </button>
                          )}
                          <button
                            onClick={handleClosePaymentModal}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl text-xs uppercase tracking-widest font-black transition-all active:scale-95 cursor-pointer"
                          >
                            Đóng cửa sổ
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flying Particles for Cart Magnet */}
      <div className="pointer-events-none fixed inset-0 z-[101]">
        {flyingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              left: particle.startX - 24,
              top: particle.startY - 24,
              scale: 0.8,
              opacity: 1,
              rotate: 0,
              position: "fixed",
            }}
            animate={{
              left: [
                particle.startX - 24,
                particle.startX - 80,
                window.innerWidth - 80,
              ],
              top: [particle.startY - 24, particle.startY - 180, 24],
              scale: [0.8, 1.2, 0.12],
              opacity: [1, 1, 0],
              rotate: [0, -30, 360],
            }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="border-gray-250 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-white p-1 shadow-2xl"
          >
            <img
              src={particle.image}
              alt="glowing-hardware"
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
