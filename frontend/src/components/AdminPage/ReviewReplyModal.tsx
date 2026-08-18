import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";

interface ReviewReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: any | null;
  onSaveReply: (reviewId: string, comment: string) => Promise<void>;
  isDarkMode?: boolean;
}

export default function ReviewReplyModal({
  isOpen,
  onClose,
  review,
  onSaveReply,
  isDarkMode = false,
}: ReviewReplyModalProps) {
  const d = isDarkMode;
  const [replyComment, setReplyComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill reply if exists
  useEffect(() => {
    if (isOpen && review) {
      setReplyComment(review.reply?.comment || "");
    } else {
      setReplyComment("");
    }
  }, [isOpen, review]);

  // Lock body scroll when modal is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveReply(review._id, replyComment.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[100] flex items-center justify-center p-4 overflow-y-auto scrollbar-none"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div
        className={`rounded-[2.5rem] p-6 md:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto relative font-sans text-xs my-auto scrollbar-none transition-all duration-300 ${
          d
            ? "bg-[#161b22] border border-[#30363d] text-white shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
            : "bg-white border border-gray-200 text-gray-955 shadow-[0_24px_70px_rgba(0,0,0,0.12)]"
        }`}
      >
        {/* Top Header close button */}
        <div className="absolute top-6 right-6 flex items-center gap-3.5 z-10">
          <button
            type="button"
            onClick={onClose}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              d
                ? "border-[#30363d] hover:border-white text-gray-400 hover:text-white"
                : "border-gray-200 hover:border-black text-gray-505 hover:text-black"
            }`}
            title="Đóng bảng phản hồi"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Title */}
        <div className="mb-6 text-left">
          <span className="text-[10px] uppercase font-mono font-black text-indigo-505 tracking-widest block mb-1">
            01 / Phản hồi đánh giá
          </span>
          <h3 className={`text-lg font-black uppercase tracking-wider ${d ? "text-white" : "text-gray-955"}`}>
            Viết Phản Hồi Từ Admin
          </h3>
          <p className={`text-xs mt-1.5 leading-relaxed ${d ? "text-gray-400" : "text-gray-500"}`}>
            Phản hồi nhanh bằng các biểu mẫu gợi ý hoặc tự viết câu trả lời để gửi tới khách hàng.
          </p>
        </div>

        {/* Selected Review Summary Card */}
        <div className={`p-5 rounded-2xl border text-left mb-6 ${
          d ? "bg-[#0d1117]/60 border-[#30363d]" : "bg-slate-50 border-gray-150"
        }`}>
          <div className="flex items-start justify-between gap-4 mb-3.5">
            <div>
              <span className={`text-[10px] uppercase font-bold text-gray-450 block tracking-wider mb-1`}>
                Sản phẩm đánh giá
              </span>
              <span className={`font-black text-sm block ${d ? "text-gray-100" : "text-gray-900"}`}>
                {review.product_id?.name || "Sản phẩm không tồn tại"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star: number) => (
                  <Star
                    key={star}
                    size={12}
                    className={star <= review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="font-extrabold text-xs ml-1">{review.rating}★</span>
            </div>
          </div>

          <div className="border-t pt-3.5 border-dashed border-gray-200 dark:border-[#30363d]">
            <span className={`text-[10px] uppercase font-bold text-gray-450 block tracking-wider mb-1`}>
              Bình luận từ {review.username || "Khách hàng"}
            </span>
            {review.title && (
              <span className={`font-extrabold block text-xs mb-1 ${d ? "text-slate-200" : "text-slate-800"}`}>
                {review.title}
              </span>
            )}
            <p className={`text-xs leading-relaxed text-gray-500 break-words`}>
              "{review.comment}"
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
              Nội dung phản hồi từ Admin
            </label>
            <textarea
              required
              rows={4}
              value={replyComment}
              onChange={(e) => setReplyComment(e.target.value)}
              placeholder="Nhập nội dung phản hồi của cửa hàng TechVie tại đây..."
              className={`w-full focus:outline-none focus:ring-1 rounded-2xl px-4 py-3 text-xs transition-all leading-relaxed ${
                d
                  ? "bg-[#161b22] border border-[#30363d] focus:!border-white focus:!ring-white !text-white placeholder-gray-600"
                  : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* Quick response templates Clipboard */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
              📋 Mẫu phản hồi nhanh (Bấm chọn và chỉnh sửa nếu cần)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 rounded-2xl border border-dashed transition-all duration-300 bg-gray-50/50 border-gray-200 dark:bg-[#0d1117]/40 dark:border-[#30363d]">
              
              {/* Positive Templates */}
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>👍 Tích cực (4 - 5 sao)</span>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      title: "Cảm ơn & chúc trải nghiệm tốt",
                      text: "Dạ TechVie chân thành cảm ơn quý khách đã tin tưởng mua sắm và dành thời gian đánh giá 5 sao cho shop ạ. Chúc quý khách có những trải nghiệm công nghệ tuyệt vời cùng sản phẩm!"
                    },
                    {
                      title: "Cam kết hậu mãi chu đáo",
                      text: "Cảm ơn quý khách đã yêu thích sản phẩm của TechVie. Nếu có bất kỳ thắc mắc hay cần hỗ trợ kỹ thuật nào trong quá trình sử dụng, xin vui lòng liên hệ ngay qua kênh chat để bên em phục vụ chu đáo nhất ạ."
                    }
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReplyComment(tpl.text)}
                      className={`text-left px-3 py-2 rounded-xl border text-[10px] font-medium leading-relaxed transition-all cursor-pointer select-none hover:text-indigo-650 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 dark:hover:border-indigo-900/60 ${
                        replyComment === tpl.text
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-850 dark:text-indigo-400"
                          : "bg-white border-gray-200 text-gray-655 dark:bg-[#161b22] dark:border-[#30363d] dark:text-gray-400"
                      }`}
                      title={tpl.text}
                    >
                      <span className="font-extrabold block text-[9px] uppercase tracking-wider mb-0.5 text-indigo-600 dark:text-indigo-400">{tpl.title}</span>
                      <span className="block truncate text-gray-405 text-[9px]">{tpl.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Negative Templates */}
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <span>👎 Tiêu cực (1 - 3 sao)</span>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      title: "Hỗ trợ bảo hành & đổi trả 1-1",
                      text: "Chào quý khách, TechVie rất tiếc vì sự cố không mong muốn mà anh/chị gặp phải với sản phẩm. Shop hỗ trợ bảo hành 1 đổi 1 tận nơi trong 12 tháng. Rất mong anh/chị liên hệ ngay hotline hoặc chat trực tiếp để bên em đổi mới sản phẩm ngay ạ!"
                    },
                    {
                      title: "Lời xin lỗi đóng gói & vận chuyển",
                      text: "Dạ TechVie chân thành xin lỗi quý khách về sự bất tiện do đơn vận chuyển bị chậm trễ hoặc đóng gói chưa đạt kỳ vọng ạ. Shop đã ghi nhận phản hồi và sẽ làm việc sát sao với đối tác bưu tá để tối ưu tốt nhất dịch vụ giao nhận ạ."
                    }
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReplyComment(tpl.text)}
                      className={`text-left px-3 py-2 rounded-xl border text-[10px] font-medium leading-relaxed transition-all cursor-pointer select-none hover:text-indigo-650 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 dark:hover:border-indigo-900/60 ${
                        replyComment === tpl.text
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-850 dark:text-indigo-400"
                          : "bg-white border-gray-200 text-gray-655 dark:bg-[#161b22] dark:border-[#30363d] dark:text-gray-400"
                      }`}
                      title={tpl.text}
                    >
                      <span className="font-extrabold block text-[9px] uppercase tracking-wider mb-0.5 text-rose-600 dark:text-rose-400">{tpl.title}</span>
                      <span className="block truncate text-gray-405 text-[9px]">{tpl.text}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-gray-100 dark:border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl border transition-all font-sans text-xs font-black uppercase cursor-pointer ${
                d
                  ? "border-[#30363d] text-gray-100 hover:bg-[#21262d] hover:text-white"
                  : "border-gray-200 text-gray-655 hover:bg-gray-50 hover:text-black"
              }`}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !replyComment.trim()}
              className={`px-5 py-2.5 rounded-xl font-sans text-xs uppercase tracking-widest font-black transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50 ${
                d
                  ? "bg-white! hover:bg-gray-100! text-black"
                  : "bg-black hover:bg-gray-900 text-white"
              }`}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
