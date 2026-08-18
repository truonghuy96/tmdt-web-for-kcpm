import React from "react";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface CustomAlertProps {
  isOpen: boolean;
  type?: AlertType;
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDarkMode?: boolean;
}

export default function CustomAlert({
  isOpen,
  type = "info",
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isDarkMode = false,
}: CustomAlertProps) {
  if (!isOpen) return null;

  // Icons mapping
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[1.8]" />;
      case "error":
        return <AlertCircle className="w-8 h-8 text-rose-400 stroke-[1.8]" />;
      case "warning":
        return <AlertTriangle className="w-8 h-8 text-amber-400 stroke-[1.8]" />;
      default:
        return <Info className="w-8 h-8 text-sky-400 stroke-[1.8]" />;
    }
  };

  // Color theme mapping
  const getGlowColor = () => {
    switch (type) {
      case "success":
        return "rgba(16, 185, 129, 0.25)";
      case "error":
        return "rgba(244, 63, 94, 0.25)";
      case "warning":
        return "rgba(245, 158, 11, 0.25)";
      default:
        return "rgba(14, 165, 233, 0.25)";
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-emerald-500/20";
      case "error":
        return "border-rose-500/20";
      case "warning":
        return "border-amber-500/20";
      default:
        return "border-sky-500/20";
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent";
      case "error":
        return "bg-rose-600 hover:bg-rose-700 text-white border border-transparent";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-black border border-transparent font-bold";
      default:
        return "bg-sky-600 hover:bg-sky-700 text-white border border-transparent";
    }
  };

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-[6px] animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl p-6 relative overflow-hidden transition-all duration-300 border ${
          isDarkMode
            ? "bg-[#181d24] border-[#30363d] text-white shadow-[0_24px_50px_rgba(0,0,0,0.85)]"
            : "bg-white border-transparent text-gray-900 shadow-[0_24px_50px_rgba(0,0,0,0.25)]"
        }`}
        style={{
          boxShadow: `0 0 35px -5px ${getGlowColor()}, 0 24px 50px -12px rgba(0, 0, 0, 0.5)`,
        }}
      >
        {/* Glow ambient background inside the alert card */}
        <div
          className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-[40px] pointer-events-none -z-10"
          style={{ backgroundColor: getGlowColor() }}
        />

        {/* Close Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
              isDarkMode ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-150 text-gray-600 hover:text-black"
            }`}
          >
            <X size={15} />
          </button>
        )}

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Icon container */}
          <div
            className={`p-4 rounded-2xl border bg-black/5 ${
              isDarkMode ? "border-white/10" : "border-gray-200"
            }`}
            style={{
              boxShadow: `inset 0 0 12px ${getGlowColor()}`,
            }}
          >
            {getIcon()}
          </div>

          <div className="space-y-2 w-full">
            {title && (
              <h3
                className={`text-sm font-black uppercase tracking-wider ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {title}
              </h3>
            )}
            <p
              className={`text-xs leading-relaxed font-bold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {message}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full pt-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98] border cursor-pointer ${
                  isDarkMode
                    ? "border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-gray-200"
                    : "border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm || onCancel}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer ${getConfirmButtonStyles()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
