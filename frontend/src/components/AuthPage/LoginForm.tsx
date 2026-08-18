import React from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (show: boolean) => void;
  isLoggingIn: boolean;
  loginError: string;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export default function LoginForm({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  showLoginPassword,
  setShowLoginPassword,
  isLoggingIn,
  loginError,
  onSubmit,
  onForgotPassword
}: LoginFormProps) {
  return (
    <motion.div
      key="login-form-div"
      initial={{ opacity: 0, x: -15, y: 1 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 15, y: -1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {loginError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl font-jakarta"
          >
            {loginError}
          </motion.div>
        )}

        {/* Email Field with Frosted Glass look */}
        <div className="space-y-1.5">
          <label className="font-jakarta text-[12px] uppercase tracking-widest text-black/60 font-semibold small-caps block ml-0.5">
            Email hoặc tên đăng nhập
          </label>
          <input 
            type="text"
            required
            placeholder="email@example.com hoặc username"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full glass-input px-4 py-3 rounded-xl font-jakarta text-sm outline-none placeholder-black/35"
          />
        </div>

        {/* Password Field with Frosted Glass look */}
        <div className="space-y-1.5">
          <label className="font-jakarta text-[12px] uppercase tracking-widest text-black/60 font-semibold small-caps block ml-0.5">
            Mật khẩu
          </label>
          <div className="relative">
            <input 
              type={showLoginPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full glass-input pl-4 pr-11 py-3 rounded-xl font-jakarta text-sm outline-none placeholder-black/35"
            />
            <button 
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/45 hover:text-black transition-opacity cursor-pointer flex items-center justify-center"
            >
              {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forget Password */}
        <div className="flex justify-between items-center mt-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input 
              type="checkbox"
              defaultChecked
              className="rounded border-black/20 text-black focus:ring-0 h-4 w-4 bg-transparent cursor-pointer" 
            />
            <span className="font-jakarta text-[12px] font-semibold text-black/60 group-hover:text-black transition-colors uppercase tracking-wider">
              Ghi nhớ tôi
            </span>
          </label>
          <a 
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
            className="font-jakarta text-[12px] font-semibold text-black hover:opacity-50 transition-opacity uppercase tracking-wider underline underline-offset-4"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-4.5 sm:py-5 bg-black text-white rounded-xl font-jakarta text-xs font-bold tracking-[0.2em] mt-2 active:scale-[0.98] transition-all glow-button uppercase cursor-pointer"
        >
          {isLoggingIn ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>ĐANG ĐĂNG NHẬP...</span>
            </div>
          ) : (
            'ĐĂNG NHẬP NGAY'
          )}
        </button>
      </form>
    </motion.div>
  );
}
