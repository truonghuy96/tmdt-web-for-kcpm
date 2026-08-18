import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { newsArticles } from "../demo/data_mockdata";
import { NewsArticle } from "../types";
import { Calendar, ChevronRight, X, Heart } from "lucide-react";

export default function NewsPage() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null,
  );
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked[id]) {
      setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
      setHasLiked((prev) => ({ ...prev, [id]: false }));
    } else {
      setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setHasLiked((prev) => ({ ...prev, [id]: true }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-7xl px-6 py-12"
    >
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="text-secondary mb-3 block text-xs font-bold tracking-[0.3em] uppercase">
          TECHVIE BLOG & LIFESTYLE
        </span>
        <h1 className="font-sans text-4xl font-extrabold tracking-tighter text-gray-950 md:text-5xl">
          Cảm Hứng & Mẹo Setup
        </h1>
        <p className="text-md mx-auto mt-3 max-w-lg font-sans leading-relaxed text-gray-500">
          Cập nhật những xu hướng trang trí góc làm việc aesthetic, mẹo tối ưu
          không gian và các chương trình ưu đãi mới nhất từ TechVie.
        </p>
      </div>

      {/* Articles Grid layout */}
      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {newsArticles.map((article) => (
          <article
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-black/20 hover:shadow-lg"
          >
            <div>
              {/* Grayscale hover to colors image strip */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={article.image}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-103 group-hover:grayscale-0"
                />

                <span className="absolute top-4 left-4 rounded-full bg-black px-3 py-1 text-[9px] font-bold tracking-widest text-white uppercase">
                  {article.category}
                </span>
              </div>

              {/* Title & info summary */}
              <div className="p-8">
                <div className="mb-3 flex items-center gap-2 font-mono text-sm text-gray-400">
                  <Calendar size={12} />
                  {article.date}
                </div>

                <h3 className="group-hover:text-secondary text-2xl leading-snug font-bold tracking-tight text-gray-900 underline-offset-4 transition-all group-hover:underline">
                  {article.title}
                </h3>

                <p className="mt-3 line-clamp-3 font-sans text-[14px] leading-relaxed text-gray-500">
                  {article.summary}
                </p>
              </div>
            </div>

            {/* Read more button strip */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-50 p-8 pt-0">
              <span className="group-hover:text-secondary flex items-center gap-1 text-[13px] font-black tracking-widest text-gray-900 uppercase transition-all group-hover:translate-x-1">
                Đọc bài viết
                <ChevronRight size={14} />
              </span>

              {/* Minimal like mechanism */}
              <button
                onClick={(e) => handleLike(article.id, e)}
                className={`text-md flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono transition-colors ${
                  hasLiked[article.id]
                    ? "bg-red-50 text-red-600"
                    : "text-gray-400 hover:bg-gray-50 hover:text-red-500"
                }`}
              >
                <Heart
                  size={14}
                  fill={hasLiked[article.id] ? "currentColor" : "none"}
                />
                {likes[article.id] || 0}
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Expanded Article Dialog Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[6px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-2xl md:p-12"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-black hover:text-black"
              >
                <X size={16} />
              </button>

              <div className="mb-6">
                <span className="mb-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  {selectedArticle.category}
                </span>

                <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-gray-950 md:text-3xl">
                  {selectedArticle.title}
                </h2>

                <div className="mt-3 flex items-center gap-3 font-mono text-sm text-gray-500">
                  <Calendar size={12} />
                  Đăng ngày {selectedArticle.date} • Tác giả TechVie Team
                </div>
              </div>

              {/* Featured banner image */}
              <div className="mb-8 aspect-[21/9] overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content body */}
              <div className="prose prose-gray text-md max-w-none space-y-4 font-sans leading-relaxed text-gray-700">
                <p className="text-lg font-semibold text-gray-900">
                  {selectedArticle.summary}
                </p>
                <p>{selectedArticle.content}</p>
                <p className="italic">
                  Đội ngũ TechVie luôn nỗ lực tìm kiếm và mang đến những giải
                  pháp phụ kiện chất lượng, giúp bạn tối ưu hóa không gian làm
                  việc và thể hiện cá tính độc bản của riêng mình.
                </p>
              </div>

              <div className="mt-10 flex justify-end border-t border-gray-100 pt-6">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="cursor-pointer rounded-full bg-black px-8 py-3 font-sans text-xs font-black tracking-widest text-white uppercase transition-colors hover:bg-gray-800"
                >
                  XEM BÀI VIẾT KHÁC →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
