import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Star,
  Send,
  ShieldCheck,
  Trash2,
  User,
  Pencil,
  MessageSquare,
  ZoomIn,
  X,
} from "lucide-react";
import { Product, TabType, Review, ReviewSummary } from "../../types";
import {
  getReviewsByProduct,
  createReview,
  deleteReview,
  getCurrentUser,
  checkCanReview,
  updateReview,
} from "../../services/api";

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedColor?: string) => void;
  onNavigate: (tab: TabType) => void;
  isLoggedIn?: boolean;
}

export default function ProductDetail({
  product,
  onClose,
  onAddToCart,
  onNavigate,
  isLoggedIn = false,
}: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined,
  );
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [checkingPurchase, setCheckingPurchase] = useState<boolean>(false);
  const [canReviewReason, setCanReviewReason] = useState<string>("");

  const [newRating, setNewRating] = useState<number>(5);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // States for editing a review
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editComment, setEditComment] = useState<string>("");
  const [isEditingSubmitting, setIsEditingSubmitting] =
    useState<boolean>(false);

  // Khóa scroll body khi modal mở, restore khi đóng
  useEffect(() => {
    if (!product) return;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [product]);

  // Đóng lightbox bằng Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsImageZoomed(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Khi product thay đổi, tự động chọn màu đầu tiên nếu có
  useEffect(() => {
    if (!product) return;
    setSelectedColor(
      Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors[0]
        : undefined,
    );

    const loadReviewsAndUser = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setCanReviewReason("");

      // Tải danh sách đánh giá từ API
      const reviewRes = await getReviewsByProduct(product.id);
      if (reviewRes.success) {
        setReviews(reviewRes.reviews);
        setSummary(reviewRes.summary);
      }

      // Kiểm tra người dùng và quyền đánh giá
      if (isLoggedIn) {
        const token = localStorage.getItem("techvie_token") || "";
        if (token) {
          setCheckingPurchase(true);
          try {
            // Lấy profile user để hiển thị nút xóa đánh giá của chính mình
            const userRes = await getCurrentUser(token);
            if (userRes.success && userRes.user) {
              setCurrentUser(userRes.user);
            }

            // Gọi endpoint can-review để kiểm tra server-side (chính xác nhất)
            const canReviewRes = await checkCanReview(product.id);
            setHasPurchased(canReviewRes.canReview === true);
            setCanReviewReason(canReviewRes.reason || "");
          } catch (err) {
            console.error("Lỗi khi tải thông tin tài khoản:", err);
          } finally {
            setCheckingPurchase(false);
          }
        }
      } else {
        setCurrentUser(null);
        setHasPurchased(false);
        setCanReviewReason("");
      }
      setIsLoading(false);
    };

    loadReviewsAndUser();
  }, [product, isLoggedIn]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?"))
      return;

    const res = await deleteReview(reviewId);
    if (res.success) {
      const reviewRes = await getReviewsByProduct(product!.id);
      if (reviewRes.success) {
        setReviews(reviewRes.reviews);
        setSummary(reviewRes.summary);
      }
      // Re-check can review after deletion
      const canReviewRes = await checkCanReview(product!.id);
      setHasPurchased(canReviewRes.canReview === true);
      setCanReviewReason(canReviewRes.reason || "");
    } else {
      alert(res.message || "Xóa đánh giá thất bại.");
    }
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    setErrorMessage("");

    const res = await createReview(product!.id, {
      rating: newRating,
      title: newTitle.trim() || undefined,
      comment: newComment.trim(),
    });

    if (res.success) {
      setNewComment("");
      setNewTitle("");
      setNewRating(5);
      setHasPurchased(false);
      setCanReviewReason("already_reviewed");

      const reviewRes = await getReviewsByProduct(product!.id);
      if (reviewRes.success) {
        setReviews(reviewRes.reviews);
        setSummary(reviewRes.summary);
      }
    } else {
      setErrorMessage(
        res.message || "Đăng đánh giá thất bại. Vui lòng thử lại.",
      );
    }
    setIsSubmitting(false);
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (!editComment.trim()) return;
    setIsEditingSubmitting(true);
    const res = await updateReview(
      reviewId,
      editRating,
      editTitle.trim(),
      editComment.trim(),
    );
    if (res.success) {
      setEditingReviewId(null);
      const reviewRes = await getReviewsByProduct(product!.id);
      if (reviewRes.success) {
        setReviews(reviewRes.reviews);
        setSummary(reviewRes.summary);
      }
    } else {
      alert(res.message || "Chỉnh sửa đánh giá thất bại. Vui lòng thử lại.");
    }
    setIsEditingSubmitting(false);
  };

  if (!product) return null;

  return (
    <>
      <AnimatePresence>
        <div
          onClick={onClose}
          className="animate-fade-in fixed inset-0 z-[100] flex cursor-pointer items-start justify-center overflow-y-auto bg-black/50 px-4 pt-16 pb-8 backdrop-blur-[6px]"
        >
          {/* Floating Close Button outside the scrollable modal card */}
          <button
            onClick={onClose}
            className="fixed top-16 right-[2.5vw] lg:right-auto lg:left-[calc(50%+576px)] lg:ml-6 z-[101] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-transparent bg-white/10 text-white/80 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:text-white group"
            title="Đóng (Esc / Click ngoài)"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            style={{ filter: "none" }}
            className="relative w-full max-w-[95vw] cursor-default rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-2xl md:max-w-6xl md:p-12"
          >
            <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:gap-16">
              {/* Image side — click to zoom */}
              <motion.div
                initial={{ opacity: 0, x: -40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 24,
                  stiffness: 280,
                  delay: 0.08,
                }}
                whileHover={{ scale: 1.02, rotate: 0.5 }}
                onClick={() => setIsImageZoomed(true)}
                className="group relative flex aspect-square cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl bg-gray-50 p-6"
              >
                {/* Zoom hint overlay */}
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/0 transition-colors duration-300 group-hover:bg-black/5">
                  <div className="rounded-full bg-white/90 p-2.5 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <ZoomIn size={18} className="text-gray-700" />
                  </div>
                </div>
                <motion.img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-80 w-full object-contain mix-blend-multiply md:max-h-[450px]"
                  whileHover={{ scale: 1.07, rotate: -1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                />
              </motion.div>

              {/* Info side */}
              <div className="text-left">
                <motion.span
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="text-secondary mb-1 block text-xs font-bold tracking-[0.2em] uppercase"
                >
                  {product.category} • TECHVIE REFINERY
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17, type: "spring", damping: 20 }}
                  className="mb-3 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl"
                >
                  {product.name}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 }}
                  className="mb-6 text-sm font-black text-indigo-600"
                >
                  {product.price.toLocaleString("vi-VN")}₫
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.27 }}
                  className="mb-6 font-sans text-sm leading-relaxed text-gray-600"
                >
                  {product.description}
                </motion.p>
                {/* Select color option — interactive picker */}
                {Array.isArray(product.colors) && product.colors.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Chọn màu sắc:
                      </span>
                      {selectedColor && (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                          {selectedColor}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, idx) => {
                        const isSelected = selectedColor === color;
                        return (
                          <motion.button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            title={color}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: 1,
                              scale: isSelected ? 1.05 : 1,
                            }}
                            transition={{
                              delay: 0.32 + idx * 0.05,
                              type: "spring",
                              damping: 18,
                            }}
                            whileHover={{ scale: isSelected ? 1.08 : 1.05 }}
                            whileTap={{ scale: 0.94 }}
                            className={[
                              "relative cursor-pointer rounded-xl border-2 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 select-none",
                              isSelected
                                ? "border-black bg-black text-white shadow-md"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm",
                            ].join(" ")}
                          >
                            {isSelected && (
                              <span className="mr-1 inline-block align-middle">
                                ✓
                              </span>
                            )}
                            {color}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Complete detailed tech specs table */}
                <div className="mb-6 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-xs">
                  <h4 className="mb-2 flex items-center gap-1.5 border-b border-gray-200 pb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    <Cpu size={12} />
                    Bảng thông số kỹ thuật (Tech Sheet)
                  </h4>
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between py-1">
                      <span className="font-sans text-gray-500">
                        {spec.label}
                      </span>
                      <span className="font-mono font-semibold text-gray-950">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  {/* Cảnh báo nếu sản phẩm có màu nhưng chưa chọn */}
                  {Array.isArray(product.colors) &&
                    product.colors.length > 0 &&
                    !selectedColor && (
                      <p className="text-center text-[11px] font-semibold text-amber-600">
                        ⚠ Vui lòng chọn màu sắc trước khi thêm vào giỏ
                      </p>
                    )}
                  <motion.button
                    onClick={() => {
                      onAddToCart(product, selectedColor);
                      onClose();
                    }}
                    disabled={
                      Array.isArray(product.colors) &&
                      product.colors.length > 0 &&
                      !selectedColor
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", damping: 16, stiffness: 400 }}
                    className="flex-grow cursor-pointer rounded-full bg-black py-4 text-center font-sans text-xs font-black tracking-widest text-white uppercase transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black"
                  >
                    Thành lập liên kết & Thêm vào giỏ
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Product Reviews & Comments Section */}
            <div className="mt-12 border-t border-gray-200 pt-8 text-left">
              <span className="text-secondary mb-3 block text-xs font-bold tracking-[0.2em] uppercase">
                COMMENT & REVIEW PRODUCT
              </span>
              <h3 className="mb-8 flex items-center gap-3 font-sans text-2xl font-extrabold tracking-tighter text-gray-950">
                Đánh giá & Bình luận
              </h3>

              {/* Breakdown stats */}
              {summary && summary.reviewCount > 0 && (
                <div className="mb-8 grid grid-cols-1 items-center gap-6 rounded-3xl border border-gray-100 bg-gray-50 p-6 md:grid-cols-3">
                  <div className="border-gray-200 py-2 text-center md:border-r">
                    <div className="text-4xl font-extrabold text-gray-900">
                      {summary.averageRating.toFixed(1)}
                    </div>
                    <div className="my-2 flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= Math.round(summary.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {summary.reviewCount} đánh giá từ khách hàng
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = summary.breakdown[stars] || 0;
                      const pct =
                        summary.reviewCount > 0
                          ? (count / summary.reviewCount) * 100
                          : 0;
                      return (
                        <div
                          key={stars}
                          className="flex items-center gap-3 text-xs text-gray-600"
                        >
                          <span className="flex w-8 items-center gap-0.5 font-bold">
                            {stars}{" "}
                            <Star
                              size={10}
                              className="fill-yellow-400 text-yellow-400"
                            />
                          </span>
                          <div className="h-2 flex-grow overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-yellow-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono text-gray-400">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* List of reviews for this product */}
              <div className="mb-8 space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-5"
                      >
                        {/* Header: avatar + name */}
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-32 rounded-full bg-gray-200" />
                            <div className="h-2 w-20 rounded-full bg-gray-100" />
                          </div>
                          {/* Stars */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <div
                                key={s}
                                className="h-3 w-3 rounded-sm bg-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                        {/* Title */}
                        <div className="mb-2 h-3 w-1/2 rounded-full bg-gray-200" />
                        {/* Body lines */}
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-full rounded-full bg-gray-100" />
                          <div className="h-2.5 w-5/6 rounded-full bg-gray-100" />
                          <div className="h-2.5 w-3/4 rounded-full bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => {
                    const userObj =
                      typeof review.user_id === "object"
                        ? review.user_id
                        : null;
                    const isOwner =
                      currentUser &&
                      currentUser.id === (userObj?._id || review.user_id);
                    const isAdmin = currentUser && currentUser.role === "admin";
                    const formattedDate = new Date(
                      review.created_at,
                    ).toLocaleDateString("vi-VN");

                    return (
                      <div
                        key={review.id || review._id}
                        className="bg-gray-55/80 border-gray-150 group relative rounded-2xl border p-5 transition-all duration-300 ease-in-out hover:-translate-y-1"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {userObj?.avatar ? (
                              <img
                                src={userObj.avatar}
                                alt={review.username}
                                className="h-10 w-10 rounded-full border border-gray-200 bg-white object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-400">
                                <User size={18} />
                              </div>
                            )}
                            <div>
                              <span className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-gray-900">
                                {review.username}
                                {review.verified_purchase && (
                                  <span className="inline-flex items-center gap-0.5 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">
                                    <ShieldCheck size={10} /> ĐÃ MUA
                                  </span>
                                )}
                                {review.isHidden && (
                                  <span className="inline-flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-black text-amber-700">
                                    Đang Ẩn (Chỉ bạn thấy)
                                  </span>
                                )}
                              </span>
                              <span className="block font-mono text-[10px] text-gray-400">
                                {formattedDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Edit button (Owner only) */}
                            {isOwner &&
                              editingReviewId !== (review.id || review._id) && (
                                <button
                                  onClick={() => {
                                    setEditingReviewId(review.id || review._id);
                                    setEditRating(review.rating);
                                    setEditTitle(review.title || "");
                                    setEditComment(review.comment);
                                  }}
                                  className="cursor-pointer p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-indigo-600"
                                  title="Chỉnh sửa đánh giá"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}

                            {/* Delete button (Admin only) */}
                            {isAdmin && (
                              <button
                                onClick={() =>
                                  handleDeleteReview(review.id || review._id)
                                }
                                className="cursor-pointer p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                                title="Xóa đánh giá này"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {editingReviewId === (review.id || review._id) ? (
                          <div className="mt-3 space-y-3 rounded-xl border border-indigo-100 bg-white p-4 text-left">
                            <div className="mb-2 flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">
                                Số sao:
                              </span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="cursor-pointer text-yellow-400 transition-transform hover:scale-110"
                                  >
                                    <Star
                                      size={16}
                                      className={
                                        star <= editRating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <input
                              type="text"
                              placeholder="Tiêu đề (Tùy chọn)"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-sans text-xs outline-none focus:border-black focus:bg-white"
                            />

                            <textarea
                              rows={3}
                              placeholder="Nội dung bình luận..."
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-sans text-xs outline-none focus:border-black focus:bg-white"
                            />

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingReviewId(null)}
                                className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                disabled={isEditingSubmitting}
                                onClick={() =>
                                  handleUpdateReview(review.id || review._id)
                                }
                                className="cursor-pointer rounded-lg bg-black px-3 py-1.5 text-[10px] font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                              >
                                {isEditingSubmitting
                                  ? "Đang lưu..."
                                  : "Lưu thay đổi"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2.5 flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={11}
                                  className={
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>

                            {review.title && (
                              <h4 className="mb-1 text-xs font-black text-gray-900">
                                {review.title}
                              </h4>
                            )}
                            <p className="font-sans text-sm leading-relaxed text-gray-700">
                              {review.comment}
                            </p>
                          </>
                        )}

                        {/* Admin reply container */}
                        {review.reply && review.reply.comment && (
                          <div className="mt-4 ml-6 flex items-start gap-3 rounded-xl border border-indigo-100/50 bg-indigo-50/20 p-4 font-sans text-xs text-gray-700">
                            <MessageSquare
                              size={16}
                              className="mt-0.5 shrink-0 text-indigo-600"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-indigo-700">
                                  {review.reply.admin_username ||
                                    "Admin TechVie"}
                                </span>
                                {review.reply.replied_at && (
                                  <span className="font-mono text-[10px] text-gray-400">
                                    {new Date(
                                      review.reply.replied_at,
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-650 font-sans leading-relaxed">
                                {review.reply.comment}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Chưa có đánh giá nào cho sản phẩm này.
                  </p>
                )}
              </div>

              {/* Add new review form */}
              <div className="min-h-[160px] rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                <h4 className="mb-4 text-sm font-bold text-gray-900">
                  Viết đánh giá của bạn
                </h4>
                {!isLoggedIn ? (
                  <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                    <p className="mb-4 text-sm text-gray-600">
                      Vui lòng đăng nhập để có thể đánh giá và bình luận sản
                      phẩm.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate("login");
                      }}
                      className="cursor-pointer rounded-full bg-black px-6 py-2.5 text-[11px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                ) : checkingPurchase ? (
                  <div className="flex animate-pulse flex-col gap-2.5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="h-3 w-2/3 rounded-full bg-gray-200" />
                    <div className="h-2.5 w-full rounded-full bg-gray-100" />
                    <div className="h-2.5 w-5/6 rounded-full bg-gray-100" />
                  </div>
                ) : canReviewReason === "already_reviewed" ? (
                  <div className="border-indigo-150 flex flex-col items-center rounded-xl border bg-indigo-50 p-5 text-center">
                    <p className="mb-1 font-sans text-sm font-bold text-indigo-900">
                      Cảm ơn bạn đã gửi đánh giá!
                    </p>
                    <p className="text-xs text-indigo-700">
                      Mỗi sản phẩm chỉ được đánh giá một lần duy nhất.
                    </p>
                  </div>
                ) : !hasPurchased ? (
                  <div className="flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-sm text-amber-800">
                      Bạn chưa thể đánh giá sản phẩm này. Chỉ những khách hàng
                      đã mua và nhận hàng thành công mới có quyền đánh giá sản
                      phẩm.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {errorMessage && (
                      <div className="border-red-150 rounded-lg border bg-red-50 p-2.5 text-xs text-red-500">
                        {errorMessage}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Đánh giá:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={18}
                            onClick={() => setNewRating(star)}
                            className={`cursor-pointer transition-colors ${star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Tiêu đề đánh giá (ví dụ: Tuyệt vời, Rất đáng tiền...)"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-sans text-sm text-gray-800 placeholder-gray-400 transition-all focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        className="min-h-[100px] w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-sans text-sm text-gray-800 placeholder-gray-400 transition-all focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitReview}
                        disabled={!newComment.trim() || isSubmitting}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-8 py-3 font-sans text-xs font-black tracking-widest text-white uppercase transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                      >
                        <Send size={14} />
                        {isSubmitting ? "ĐANG GỬI..." : "GỬI ĐÁNH GIÁ"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {isImageZoomed && product && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsImageZoomed(false)}
            className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-black/92 p-4 backdrop-blur-xl"
          >
            {/* Close button */}
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-5 right-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-200 hover:scale-105 hover:bg-white/25"
              title="Đóng (Esc)"
            >
              <X size={18} />
            </button>

            {/* Image */}
            <motion.img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="max-h-[88vh] max-w-[90vw] cursor-default object-contain drop-shadow-2xl"
            />

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="pointer-events-none absolute right-0 bottom-6 left-0 text-center"
            >
              <span className="font-mono text-xs tracking-widest text-white/70 uppercase">
                {product.name}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
