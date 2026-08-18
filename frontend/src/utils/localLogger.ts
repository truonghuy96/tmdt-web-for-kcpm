/**
 * TechVie Local Debug Logger (Gitignored)
 * Hỗ trợ in nhật ký (logs) có cấu trúc đẹp mắt trong Console của trình duyệt để gỡ lỗi.
 */

const IS_DEV = import.meta.env.DEV || true;

export const localLogger = {
  info: (moduleName: string, message: string, details?: any) => {
    if (!IS_DEV) return;
    console.log(
      `%c[${moduleName}] INFO: %c${message}`,
      "color: #6366f1; font-weight: bold; background-color: #f5f3ff; padding: 2px 6px; border-radius: 4px;",
      "color: #1f2937;",
      details ? details : ""
    );
  },

  success: (moduleName: string, message: string, details?: any) => {
    if (!IS_DEV) return;
    console.log(
      `%c[${moduleName}] SUCCESS: %c${message}`,
      "color: #10b981; font-weight: bold; background-color: #ecfdf5; padding: 2px 6px; border-radius: 4px;",
      "color: #1f2937;",
      details ? details : ""
    );
  },

  warn: (moduleName: string, message: string, details?: any) => {
    if (!IS_DEV) return;
    console.warn(
      `%c[${moduleName}] WARNING: ${message}`,
      "color: #f59e0b; font-weight: bold;",
      details ? details : ""
    );
  },

  error: (moduleName: string, message: string, error?: any) => {
    if (!IS_DEV) return;
    console.error(
      `%c[${moduleName}] ERROR: ${message}`,
      "color: #ef4444; font-weight: bold;",
      error ? error : ""
    );
  }
};
