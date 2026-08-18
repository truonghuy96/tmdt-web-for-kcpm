import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDarkMode?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isDarkMode = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12 font-sans">
      {/* Back button */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
          isDarkMode
            ? "border-[#30363d] hover:bg-[#21262d] text-white"
            : "border-gray-200 hover:bg-gray-50 text-gray-700"
        }`}
      >
        <ChevronLeft size={14} />
      </button>

      {/* Pages list */}
      {pages[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
              currentPage === 1
                ? (isDarkMode ? "bg-white text-black border-white" : "bg-black text-white border-black")
                : (isDarkMode ? "border-[#30363d] hover:bg-[#21262d] text-white" : "border-gray-200 hover:bg-gray-50 text-gray-700")
            }`}
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className={`text-[10px] px-1 font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>...</span>
          )}
        </>
      )}

      {pages.map((p) => {
        const isActive = currentPage === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
              isActive
                ? (isDarkMode ? "bg-white text-black border-white" : "bg-black text-white border-black")
                : (isDarkMode ? "border-[#30363d] hover:bg-[#21262d] text-white" : "border-gray-250 hover:bg-gray-50 text-gray-700")
            }`}
          >
            {p}
          </button>
        );
      })}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className={`text-[10px] px-1 font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>...</span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
              currentPage === totalPages
                ? (isDarkMode ? "bg-white text-black border-white" : "bg-black text-white border-black")
                : (isDarkMode ? "border-[#30363d] hover:bg-[#21262d] text-white" : "border-gray-250 hover:bg-gray-50 text-gray-700")
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
          isDarkMode
            ? "border-[#30363d] hover:bg-[#21262d] text-white"
            : "border-gray-200 hover:bg-gray-50 text-gray-700"
        }`}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
