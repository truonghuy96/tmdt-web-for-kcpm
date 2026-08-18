import React from 'react';
import { showError } from '../../utils/toast';
import { API_BASE_URL } from '../../services/api';

interface SocialConnectProps {
  mode: 'login' | 'register';
  onLoginSuccess: (email: string) => void;
  onRegisterSuccess: (email: string, name: string) => void;
}

export default function SocialConnect({
  mode,
  onLoginSuccess,
  onRegisterSuccess
}: SocialConnectProps) {
  const handleGoogleClick = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`);
      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        showError("Không thể khởi tạo phiên kết nối OAuth2 với Google.");
      }
    } catch (error) {
      console.error("Lỗi chuyển hướng Google OAuth:", error);
      showError("Lỗi kết nối máy chủ Google OAuth.");
    }
  };

  return (
    <div className="mt-7 relative z-10 font-jakarta">
      <div className="flex items-center gap-4 mb-3">
        <div className="h-[1px] flex-1 bg-black/5"></div>
        <span className="font-jakarta text-[12px] font-bold text-black/40 uppercase tracking-[0.25em] small-caps">
          Tiếp tục với
        </span>
        <div className="h-[1px] flex-1 bg-black/5"></div>
      </div>

      <div className="flex gap-3.5">
        <button 
          type="button"
          onClick={handleGoogleClick}
          className="flex-1 h-13 border border-black/10 bg-white/40 hover:bg-white/60 rounded-xl flex items-center justify-center transition-all active:scale-95 glass-edge cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" role="img" viewBox="0 0 24 24" fill="currentColor">
            <title>Google</title>
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          <span className="font-jakarta text-[11px] font-bold tracking-[0.15em] uppercase">Google</span>
        </button>
      </div>
    </div>
  );
}
