import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  Trash2,
  RotateCcw,
  Search,
  RefreshCw,
  MessageSquare,
  Calendar,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import ReviewReplyModal from "./ReviewReplyModal";
import {
  getAdminReviews,
  getAdminReviewStats,
  deleteReview,
  restoreReview,
  sendClientLog,
  replyReview,
  toggleHideReview,
} from "../../services/api";

interface ReviewManagerProps {
  isDarkMode?: boolean;
  onRefreshStats?: () => void;
}

export default function ReviewManager({
  isDarkMode = false,
  onRefreshStats,
}: ReviewManagerProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalReviews: 0,
    deletedReviews: 0,
    recentReviews: 0,
    averageRating: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // States for replying to reviews
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [isReplyingSubmit, setIsReplyingSubmit] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<any | null>(null);

  // Ref for custom rating dropdown
  const ratingDropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý sự kiện click ra ngoài để tự động đóng menu rating filter
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ratingDropdownRef.current &&
        !ratingDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRatingDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const d = isDarkMode;

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      // 1. Fetch stats
      const statsRes = await getAdminReviewStats();
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }

      // 2. Fetch reviews
      const reviewsRes = await getAdminReviews({
        search: searchQuery || undefined,
        rating: ratingFilter === "all" ? undefined : ratingFilter,
        includeDeleted: includeDeleted,
      });

      if (reviewsRes.success && reviewsRes.reviews) {
        setReviews(reviewsRes.reviews);
      }

      if (onRefreshStats) {
        onRefreshStats();
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu review admin:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ratingFilter, includeDeleted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    // Trigger load directly with empty search
    setIsLoading(true);
    getAdminReviews({
      rating: ratingFilter === "all" ? undefined : ratingFilter,
      includeDeleted: includeDeleted,
    }).then((res) => {
      if (res.success && res.reviews) {
        setReviews(res.reviews);
      }
      setIsLoading(false);
    });
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyComment.trim()) return;
    setIsReplyingSubmit(true);
    try {
      sendClientLog(
        `[ReviewManager] Admin gửi phản hồi cho đánh giá ID: ${reviewId}`,
        "log",
      );
      const res = await replyReview(reviewId, replyComment.trim());
      if (res.success) {
        sendClientLog(`[ReviewManager] Đã gửi phản hồi thành công`, "log");
        setReplyingReviewId(null);
        setReplyComment("");
        loadData(false);
      } else {
        alert(res.message || "Gửi phản hồi thất bại");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Đã có lỗi xảy ra");
    } finally {
      setIsReplyingSubmit(false);
    }
  };

  const handleSaveReply = async (reviewId: string, comment: string) => {
    try {
      sendClientLog(
        `[ReviewManager] Admin gửi phản hồi qua modal cho đánh giá ID: ${reviewId}`,
        "log",
      );
      const res = await replyReview(reviewId, comment);
      if (res.success) {
        sendClientLog(`[ReviewManager] Đã gửi phản hồi thành công`, "log");
        loadData(false);
      } else {
        alert(res.message || "Gửi phản hồi thất bại");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Đã có lỗi xảy ra");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (
      !confirm(
        "Bạn chắc chắn muốn xóa ẩn đánh giá này khỏi hệ thống công cộng?",
      )
    )
      return;

    setActionInProgress(reviewId);
    try {
      sendClientLog(
        `[ReviewManager] Admin yêu cầu xóa đánh giá ID: ${reviewId}`,
        "log",
      );
      const res = await deleteReview(reviewId);
      if (res.success) {
        sendClientLog(`[ReviewManager] Đã xóa đánh giá thành công`, "log");
        loadData(false);
      } else {
        alert(res.message || "Xóa đánh giá thất bại");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Đã có lỗi xảy ra");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRestore = async (reviewId: string) => {
    setActionInProgress(reviewId);
    try {
      sendClientLog(
        `[ReviewManager] Admin yêu cầu khôi phục đánh giá ID: ${reviewId}`,
        "log",
      );
      const res = await restoreReview(reviewId);
      if (res.success) {
        sendClientLog(
          `[ReviewManager] Đã khôi phục đánh giá thành công`,
          "log",
        );
        loadData(false);
      } else {
        alert(res.message || "Khôi phục đánh giá thất bại");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Đã có lỗi xảy ra");
    } finally {
      setActionInProgress(null);
    }
  };
  const handleToggleHide = async (
    reviewId: string,
    currentHiddenStatus: boolean,
  ) => {
    setActionInProgress(reviewId);
    try {
      const nextStatus = !currentHiddenStatus;
      sendClientLog(
        `[ReviewManager] Admin yêu cầu ${nextStatus ? "ẩn" : "hiển thị lại"} đánh giá ID: ${reviewId}`,
        "log",
      );
      const res = await toggleHideReview(reviewId, nextStatus);
      if (res.success) {
        sendClientLog(`[ReviewManager] Cập nhật ẩn/hiện thành công`, "log");
        loadData(false);
      } else {
        alert(res.message || "Thay đổi trạng thái ẩn/hiện thất bại");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Đã có lỗi xảy ra");
    } finally {
      setActionInProgress(null);
    }
  };

  // Helper calculating percentages
  const totalStarStats = Object.values(stats.breakdown).reduce(
    (a: any, b: any) => a + b,
    0,
  ) as number;
  const fiveStarCount = stats.breakdown[5] || 0;
  const fiveStarPercentage =
    totalStarStats > 0 ? Math.round((fiveStarCount / totalStarStats) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-8 font-sans">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng đánh giá */}
        <div
          className={`relative flex flex-col items-start overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition-all duration-300 ${
            d
              ? "border-[#30363d] bg-[#161b22] text-white"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <div
            className={`mb-4 rounded-2xl p-3 ${d ? "bg-indigo-950/40 text-indigo-400" : "bg-indigo-50 text-indigo-700"}`}
          >
            <MessageSquare size={18} />
          </div>
          <span className="font-mono text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
            Tổng Đánh Giá
          </span>
          <span className="mt-1 text-3xl font-black tracking-tight">
            {stats.totalReviews}
          </span>
          <div className="mt-2 font-mono text-[10px] text-gray-500">
            Đang hoạt động công khai
          </div>
        </div>

        {/* Card 2: Điểm trung bình */}
        <div
          className={`relative flex flex-col items-start overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition-all duration-300 ${
            d
              ? "border-[#30363d] bg-[#161b22] text-white"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <div
            className={`mb-4 rounded-2xl p-3 ${d ? "bg-amber-950/40 text-amber-500" : "bg-amber-50 text-amber-600"}`}
          >
            <Star size={18} className="fill-amber-500 text-amber-500" />
          </div>
          <span className="font-mono text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
            Điểm Trung Bình
          </span>
          <span className="mt-1 flex items-baseline gap-1.5 text-3xl font-black tracking-tight">
            {stats.averageRating}
            <span className="text-xs font-bold text-gray-400">/ 5</span>
          </span>
          <div className="mt-2 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={10}
                className={
                  s <= Math.round(stats.averageRating)
                    ? "fill-amber-500 text-amber-500"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
        </div>

        {/* Card 3: 7 Ngày gần đây */}
        <div
          className={`relative flex flex-col items-start overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition-all duration-300 ${
            d
              ? "border-[#30363d] bg-[#161b22] text-white"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <div
            className={`mb-4 rounded-2xl p-3 ${d ? "bg-emerald-950/40 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
          >
            <Calendar size={18} />
          </div>
          <span className="font-mono text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
            Đánh Giá Gần Đây
          </span>
          <span className="mt-1 text-3xl font-black tracking-tight">
            +{stats.recentReviews}
          </span>
          <div className="mt-2 font-mono text-[10px] font-extrabold text-emerald-500">
            Trong 7 ngày qua
          </div>
        </div>

        {/* Card 4: Tỉ lệ 5 sao */}
        <div
          className={`relative flex flex-col items-start overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition-all duration-300 ${
            d
              ? "border-[#30363d] bg-[#161b22] text-white"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <div
            className={`mb-4 rounded-2xl p-3 ${d ? "bg-rose-950/40 text-rose-400" : "bg-rose-50 text-rose-500"}`}
          >
            <ThumbsUp size={18} />
          </div>
          <span className="font-mono text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
            Tỉ Lệ Đánh Giá 5★
          </span>
          <span className="mt-1 text-3xl font-black tracking-tight">
            {fiveStarPercentage}%
          </span>
          <div className="mt-2 font-mono text-[10px] text-gray-500">
            Đạt {fiveStarCount} lượt 5 sao
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div
        className={`rounded-[2rem] border p-6 transition-all duration-300 sm:p-8 ${
          d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
        }`}
      >
        {/* Controls Toolbar */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full items-center gap-2 md:w-auto"
          >
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nội dung, tên SP, thành viên..."
                className={`h-11 w-full rounded-xl border pr-8 pl-9 text-xs font-semibold transition-all duration-300 outline-none ${
                  d
                    ? "border-[#30363d] bg-[#0d1117]/60 text-white placeholder-gray-500 focus:border-white focus:bg-[#161b22]"
                    : "text-gray-905 border-slate-200 bg-slate-50 placeholder-gray-400 focus:border-black focus:bg-white"
                }`}
              />
              <Search
                size={14}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-black text-gray-400 hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className={`flex h-11 cursor-pointer items-center gap-1.5 rounded-xl px-4 text-xs font-bold tracking-wider uppercase shadow-xs transition-all active:scale-95 ${
                d
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-slate-100 text-gray-800 hover:bg-slate-200"
              }`}
            >
              Lọc
            </button>
          </form>

          {/* Filtering controls */}
          <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto">
            {/* Custom Star filter dropdown */}
            <div
              className="relative flex items-center gap-2"
              ref={ratingDropdownRef}
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase select-none">
                Số sao:
              </span>
              <div className="relative w-44">
                <button
                  type="button"
                  onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                  className={`flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border px-4 text-left transition-all duration-200 ${
                    d
                      ? isRatingDropdownOpen
                        ? "border-indigo-500 bg-[#161b22] text-white shadow-sm"
                        : "border-[#30363d] bg-[#161b22] text-white hover:border-gray-700 hover:bg-[#21262d]/50"
                      : isRatingDropdownOpen
                        ? "text-gray-905 border-black bg-white shadow-sm"
                        : "text-gray-905 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  } `}
                >
                  <span
                    className={`text-xs font-bold ${d ? "text-white" : "text-gray-900"}`}
                  >
                    {ratingFilter === "all" && "Tất cả sao"}
                    {ratingFilter === "5" && "5 sao ★★★★★"}
                    {ratingFilter === "4" && "4 sao ★★★★"}
                    {ratingFilter === "3" && "3 sao ★★★"}
                    {ratingFilter === "2" && "2 sao ★★"}
                    {ratingFilter === "1" && "1 sao ★"}
                  </span>

                  {/* Chevron Arrow */}
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isRatingDropdownOpen ? "rotate-180 text-black dark:text-white" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isRatingDropdownOpen && (
                  <div
                    className={`animate-fade-in absolute top-full left-0 z-50 mt-2 w-full rounded-2xl border py-2 text-xs shadow-xl transition-all duration-350 ${
                      d
                        ? "border-[#30363d] bg-[#161b22] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                        : "border-gray-200 bg-white text-gray-900 shadow-xl"
                    }`}
                  >
                    <ul
                      className="max-h-60 scrollbar-none space-y-1 overflow-auto"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {[
                        { value: "all", label: "Tất cả sao" },
                        { value: "5", label: "5 sao ★★★★★" },
                        { value: "4", label: "4 sao ★★★★" },
                        { value: "3", label: "3 sao ★★★" },
                        { value: "2", label: "2 sao ★★" },
                        { value: "1", label: "1 sao ★" },
                      ].map((opt) => (
                        <li
                          key={opt.value}
                          onClick={() => {
                            setRatingFilter(opt.value);
                            setIsRatingDropdownOpen(false);
                          }}
                          className={`group mx-2 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                            ratingFilter === opt.value
                              ? d
                                ? "bg-[#21262d] font-black text-white hover:bg-white/10 hover:text-white"
                                : "bg-slate-100 font-black text-black hover:bg-black hover:text-white"
                              : d
                                ? "text-gray-350 font-bold hover:bg-[#21262d] hover:text-white"
                                : "font-bold text-gray-600 hover:bg-black hover:text-white"
                          } `}
                        >
                          <span className="flex-1 text-xs">{opt.label}</span>

                          {/* Checkmark indicator */}
                          {ratingFilter === opt.value && (
                            <svg
                              className={`h-4 w-4 transition-colors group-hover:text-white ${d ? "text-white" : "text-black"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Toggle show deleted items */}
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`h-5 w-9 rounded-full transition-colors duration-300 ${
                    includeDeleted
                      ? "bg-indigo-600"
                      : d
                        ? "bg-[#30363d]"
                        : "bg-slate-200"
                  }`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    includeDeleted ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Xem Đã Xóa
              </span>
            </label>

            {/* Refresh button */}
            <button
              onClick={() => loadData(true)}
              disabled={isLoading}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border transition-all ${
                isLoading ? "opacity-50" : "active:scale-95"
              } ${
                d
                  ? "border-[#30363d] bg-[#0d1117] text-white hover:bg-white/5"
                  : "border-slate-200 bg-slate-50 text-gray-700 hover:bg-slate-100"
              }`}
              title="Tải lại dữ liệu"
            >
              <RefreshCw
                size={14}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div
          className={`overflow-hidden rounded-[2rem] border transition-colors duration-300 ${
            d ? "border-[#30363d] bg-[#161b22]" : "border-slate-200/80 bg-white"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr
                  className={`border-b text-[9px] font-extrabold tracking-wider uppercase transition-colors duration-300 ${
                    d
                      ? "border-[#30363d] bg-[#0d1117]/60 text-gray-500"
                      : "border-slate-150 bg-slate-50 text-slate-400"
                  }`}
                >
                  <th className="px-6 py-4.5 whitespace-nowrap">Sản phẩm</th>
                  <th className="px-6 py-4.5 whitespace-nowrap">Khách hàng</th>
                  <th className="px-6 py-4.5 whitespace-nowrap">Số sao</th>
                  <th className="px-6 py-4.5 whitespace-nowrap">
                    Nội dung đánh giá
                  </th>
                  <th className="px-6 py-4.5 whitespace-nowrap">Ngày gửi</th>
                  <th className="px-6 py-4.5 whitespace-nowrap">Trạng thái</th>
                  <th className="px-6 py-4.5 text-right whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y transition-colors duration-300 ${d ? "divide-[#30363d]" : "divide-slate-150"}`}
              >
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw
                          size={24}
                          className="animate-spin text-indigo-500"
                        />
                        <span className="font-mono text-xs">
                          Đang nạp danh sách đánh giá...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle size={32} className="text-gray-300" />
                        <div className="text-sm font-extrabold tracking-wider uppercase">
                          Không tìm thấy đánh giá nào
                        </div>
                        <div className="text-xs text-gray-500">
                          Hãy thử thay đổi bộ lọc tìm kiếm hoặc từ khóa của bạn.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reviews.map((rev) => {
                    const prodName =
                      rev.product_id?.name || "Sản phẩm không tồn tại";
                    const prodImage =
                      rev.product_id?.image ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
                    const memberName = rev.username || "Người dùng TechVie";
                    const memberEmail = rev.user_id?.email || "N/A";

                    return (
                      <tr
                        key={rev._id}
                        className={`transition-colors duration-300 ${
                          d
                            ? `hover:bg-[#21262d]/50 ${rev.isDeleted ? "bg-rose-950/10" : ""}`
                            : `hover:bg-slate-50/40 ${rev.isDeleted ? "bg-rose-50/10" : ""}`
                        }`}
                      >
                        {/* Product info */}
                        <td className="max-w-[200px] px-6 py-4 text-left">
                          <div className="flex items-center gap-3">
                            <img
                              src={prodImage}
                              alt={prodName}
                              className="border-gray-250/20 h-10 w-10 shrink-0 rounded-xl border object-cover"
                            />
                            <div className="truncate text-left">
                              <span
                                className={`block truncate font-bold transition-colors duration-300 ${d ? "text-gray-100" : "text-gray-900"}`}
                                title={prodName}
                              >
                                {prodName}
                              </span>
                              <span className="text-gray-505 block truncate text-[10px]">
                                ID: {rev.product_id?._id || rev.product_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="px-6 py-4 text-left">
                          <div>
                            <span
                              className={`block font-extrabold transition-colors duration-300 ${d ? "text-gray-100" : "text-gray-900"}`}
                            >
                              {memberName}
                            </span>
                            <span className="text-gray-550 block text-[10px]">
                              {memberEmail}
                            </span>
                          </div>
                        </td>

                        {/* Rating stars */}
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center gap-1">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={11}
                                  className={
                                    star <= rev.rating
                                      ? "fill-amber-500 text-amber-500"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                            <span
                              className={`ml-1 text-xs font-bold ${rev.rating >= 4 ? "text-amber-500" : rev.rating === 3 ? "text-gray-500" : "text-rose-500"}`}
                            >
                              {rev.rating}★
                            </span>
                          </div>
                        </td>

                        {/* Review Content */}
                        <td className="max-w-[300px] px-6 py-4 text-left">
                          <div>
                            {rev.title && (
                              <span
                                className={`mb-1 block text-xs font-bold transition-colors duration-300 ${d ? "text-gray-200" : "text-gray-800"}`}
                              >
                                {rev.title}
                              </span>
                            )}
                            <p
                              className="text-xs leading-relaxed break-words text-gray-500"
                              title={rev.comment}
                            >
                              {rev.comment}
                            </p>

                            {/* Existing Reply */}
                            {rev.reply && rev.reply.comment && (
                              <div
                                className={`mt-2.5 rounded-2xl border p-3 text-[11px] leading-relaxed transition-colors duration-300 ${
                                  d
                                    ? "border-[#30363d] bg-[#0d1117]/60 text-gray-400"
                                    : "border-slate-150 bg-slate-50 text-slate-500"
                                }`}
                              >
                                <div className="mb-0.5 flex items-center gap-1 font-extrabold text-indigo-600">
                                  <MessageSquare size={10} />
                                  {rev.reply.admin_username || "Admin"} phản
                                  hồi:
                                </div>
                                <p className="break-words">
                                  {rev.reply.comment}
                                </p>
                              </div>
                            )}

                            {/* Phản hồi button (Modal trigger) */}
                            {!rev.isDeleted && (
                              <button
                                onClick={() => {
                                  setSelectedReviewForReply(rev);
                                }}
                                className="hover:text-indigo-650 mt-2 flex cursor-pointer items-center gap-1 text-[10px] font-black tracking-wider text-indigo-500 uppercase transition-colors"
                              >
                                <MessageSquare size={10} />
                                {rev.reply?.comment
                                  ? "Sửa phản hồi"
                                  : "Phản hồi"}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="text-gray-550 px-6 py-4 text-left whitespace-nowrap">
                          {rev.created_at
                            ? new Date(rev.created_at).toLocaleDateString(
                                "vi-VN",
                              )
                            : "N/A"}
                        </td>

                        {/* Status badge */}
                        <td className="space-y-1 px-6 py-4 text-left">
                          {rev.isDeleted ? (
                            <span
                              className={`block w-max rounded border px-2 py-0.5 font-mono text-[9px] font-black tracking-wider uppercase ${
                                d
                                  ? "bg-rose-955/30 border-rose-900/40 text-rose-500"
                                  : "border-rose-250 bg-rose-50 text-rose-600"
                              }`}
                            >
                              Đã Xóa
                            </span>
                          ) : rev.isHidden ? (
                            <span
                              className={`block w-max rounded border px-2 py-0.5 font-mono text-[9px] font-black tracking-wider uppercase ${
                                d
                                  ? "bg-amber-955/30 border-amber-900/40 text-amber-500"
                                  : "border-amber-250 bg-amber-50 text-amber-700"
                              }`}
                            >
                              Đang Ẩn
                            </span>
                          ) : (
                            <span
                              className={`block w-max rounded border px-2 py-0.5 font-mono text-[9px] font-black tracking-wider uppercase ${
                                d
                                  ? "bg-emerald-955/30 border-emerald-900/40 text-emerald-400"
                                  : "border-emerald-250 bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              Công khai
                            </span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            {rev.isDeleted ? (
                              <button
                                onClick={() => handleRestore(rev._id)}
                                disabled={actionInProgress === rev._id}
                                className={`flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold tracking-wider uppercase shadow-xs active:scale-95 ${
                                  d
                                    ? "bg-zinc-800 text-white hover:bg-zinc-700"
                                    : "bg-slate-100 text-gray-800 hover:bg-slate-200"
                                }`}
                                title="Khôi phục đánh giá này"
                              >
                                <RotateCcw
                                  size={12}
                                  className={
                                    actionInProgress === rev._id
                                      ? "animate-spin"
                                      : ""
                                  }
                                />
                                Khôi phục
                              </button>
                            ) : (
                              <>
                                {/* Hide/Unhide toggle */}
                                <button
                                  onClick={() =>
                                    handleToggleHide(
                                      rev._id,
                                      rev.isHidden || false,
                                    )
                                  }
                                  disabled={actionInProgress === rev._id}
                                  className={`flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold tracking-wider uppercase shadow-xs active:scale-95 ${
                                    rev.isHidden
                                      ? d
                                        ? "bg-amber-955/40 hover:bg-amber-955/60 border border-amber-900/40 text-amber-400"
                                        : "border-amber-250 border bg-amber-50 text-amber-700 hover:bg-amber-100"
                                      : d
                                        ? "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                                        : "bg-slate-100 text-gray-700 hover:bg-slate-200"
                                  }`}
                                  title={
                                    rev.isHidden
                                      ? "Hiển thị lại công khai"
                                      : "Ẩn khỏi những người dùng khác"
                                  }
                                >
                                  {rev.isHidden ? "Hiện lại" : "Ẩn đi"}
                                </button>

                                {/* Delete button */}
                                <button
                                  onClick={() => handleDelete(rev._id)}
                                  disabled={actionInProgress === rev._id}
                                  className="hover:text-rose-650 flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold tracking-wider text-rose-500 uppercase transition-all hover:bg-rose-500/5 active:scale-95"
                                  title="Xóa hoàn toàn đánh giá này"
                                >
                                  <Trash2
                                    size={12}
                                    className={
                                      actionInProgress === rev._id
                                        ? "animate-spin"
                                        : ""
                                    }
                                  />
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Reply Modal Popup */}
      <ReviewReplyModal
        isOpen={selectedReviewForReply !== null}
        onClose={() => setSelectedReviewForReply(null)}
        review={selectedReviewForReply}
        onSaveReply={handleSaveReply}
        isDarkMode={d}
      />
    </div>
  );
}
