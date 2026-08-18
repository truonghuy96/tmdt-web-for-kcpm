import React, { useState } from "react";
import { MapPin, ArrowRight, Copy, Check, Loader2, ShieldCheck, ShieldAlert, MailCheck } from "lucide-react";
import { updateUserProfile, sendEmailVerification } from "../../services/api";
import { showSuccess, showError } from "../../utils/toast";

interface TabProfileProps {
  userProfile: any;
  setUserProfile: (profile: any) => void;
}

export default function TabProfile({
  userProfile,
  setUserProfile,
}: TabProfileProps) {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEmailVerified =
    userProfile.authProvider === "google" ||
    userProfile.isEmailVerified ||
    !!localStorage.getItem(`verified_email_${userProfile.email}`);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateUserProfile({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      });
      if (res.success && res.user) {
        setUserProfile({
          ...userProfile,
          name: res.user.name,
          phone: res.user.phone,
          address: res.user.address,
        });
        console.log("Lưu thông tin hồ sơ cá nhân thành công!");
      } else {
        console.error(res.message || "Lỗi lưu hồ sơ.");
      }
    } catch (error) {
      console.error(error);
      console.error("Lỗi kết nối khi lưu hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(userProfile.email || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    try {
      const res = await sendEmailVerification();
      if (res.success) {
        showSuccess(res.message, {
          icon: "✉️",
        });
      } else {
        showError(res.message || "Không thể gửi email xác thực.");
      }
    } catch (error) {
      showError("Đã xảy ra lỗi khi gửi yêu cầu xác thực email.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="h-full bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6 relative overflow-hidden flex flex-col shadow-sm">
      {/* Top subtle glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/40 rounded-full blur-[80px] pointer-events-none" />

      {/* Section Header */}
      <div className="mb-4 border-b border-white/60 pb-2">
        <h3 className="font-headline-lg text-headline-lg text-[#2d3748] tracking-widest">
          HỒ SƠ THÀNH VIÊN
        </h3>
        <p className="text-[#4a5568] mt-1 text-[15px]">
          Các thông tin cá nhân của bạn phục vụ điền nhanh bưu kiện tại trang Thanh toán.
        </p>
      </div>

      {/* Form Grid */}
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Input: Full Name */}
        <div className="space-y-1.5">
          <label className="font-tech-label text-tech-label text-xs text-[#4a5568]">
            HỌ VÀ TÊN
          </label>
          <input
            className="w-full bg-white/70 border border-gray-200/50 hover:border-gray-300 rounded-lg px-3.5 py-2.5 text-[#2d3748] text-[15px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 placeholder-[#4a5568]/50 shadow-sm mt-1.5"
            type="text"
            value={userProfile.name}
            onChange={(e) =>
              setUserProfile({ ...userProfile, name: e.target.value })
            }
          />
        </div>

        {/* Input: Phone */}
        <div className="space-y-1.5">
          <label className="font-tech-label text-tech-label text-xs text-[#4a5568]">
            SỐ ĐIỆN THOẠI LIÊN HỆ
          </label>
          <input
            className="w-full bg-white/70 border border-gray-200/50 hover:border-gray-300 rounded-lg px-3.5 py-2.5 text-[#2d3748] text-[15px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 shadow-sm mt-1.5 placeholder-[#4a5568]/40"
            type="text"
            placeholder="Chưa cung cấp"
            value={
              !userProfile.phone || userProfile.phone === "Chưa cung cấp"
                ? ""
                : userProfile.phone
            }
            onChange={(e) =>
              setUserProfile({ ...userProfile, phone: e.target.value })
            }
          />
        </div>

        {/* Input: Email (Readonly) */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="font-tech-label text-tech-label text-xs text-[#4a5568]">
              EMAIL ĐĂNG KÝ
            </label>
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-250/20 px-2 py-0.5 rounded-md font-tech-label tracking-normal">
                <ShieldCheck size={12} className="text-emerald-600" />
                {userProfile.authProvider === "google" ? "ĐÃ XÁC THỰC (GOOGLE)" : "ĐÃ XÁC THỰC"}
              </span>
            ) : (
              <div className="relative group/tooltip">
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={isVerifying}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100/80 border border-amber-250/20 px-2 py-0.5 rounded-md font-tech-label !tracking-normal transition-colors cursor-pointer mb-1.5"
                >
                  {isVerifying ? (
                    <Loader2 size={12} className="animate-spin text-amber-600" />
                  ) : (
                    <ShieldAlert size={12} className="text-amber-600" />
                  )}
                  CHƯA XÁC THỰC (CLICK ĐỂ XÁC THỰC)
                </button>
                {/* Tooltip gợi ý mã giảm giá */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-neutral-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-300 z-[99] text-center font-semibold leading-relaxed border border-neutral-800">
                  Xác thực email ngay để nhận ngay <span className="text-amber-400 font-bold">mã giảm giá 10%</span> gửi trực tiếp vào hòm thư của bạn!
                  {/* Mũi tên chỉ xuống */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                </div>
              </div>
            )}
          </div>
          <div className="relative mt-1.5 flex items-center">
            <input
              className="w-full bg-gray-100/50 border border-gray-200/50 rounded-lg pl-3.5 pr-12 py-2.5 text-[#4a5568] text-[15px] cursor-not-allowed shadow-sm"
              readOnly
              type="email"
              value={userProfile.email}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-3 p-1.5 text-gray-400 hover:text-black rounded-md transition-colors cursor-pointer flex items-center justify-center"
              title="Sao chép email"
            >
              {copied ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Input: Address */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-tech-label text-tech-label text-xs text-[#4a5568]">
            ĐỊA CHỈ GIAO NHẬN MẶC ĐỊNH
          </label>
          <textarea
            className="w-full bg-white/70 border border-gray-200/50 hover:border-gray-300 rounded-lg px-3.5 py-2.5 text-[#2d3748] text-[15px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 resize-none shadow-sm mt-1.5 placeholder-[#4a5568]/40"
            rows={2}
            placeholder="Chưa cung cấp"
            value={userProfile.address}
            onChange={(e) =>
              setUserProfile({ ...userProfile, address: e.target.value })
            }
          />
        </div>

        {/* Disclaimer */}
        <div className="md:col-span-2">
          <p className="text-[12px] text-gray-500 italic">
            * Khách hàng đảm bảo các thông tin cung cấp là đúng sự thật. TechVie không chịu trách nhiệm cho các sai sót phát sinh từ thông tin do khách hàng nhập.
          </p>
        </div>

        {/* Submit Action */}
        <div className="md:col-span-2 pt-2">
          <button
            className="px-5 py-3 bg-black hover:bg-gray-800 text-white font-tech-label text-tech-label rounded-lg transition-all duration-300 flex items-center gap-2 group shadow-md cursor-pointer float-right !text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>ĐANG LƯU HỒ SƠ...</span>
              </>
            ) : (
              <>
                <span>LƯU HỒ SƠ THÔNG TIN</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Supplementary Info / Shortcut */}
      {/* <div className="mt-4 pt-3 border-t border-white/60">
        <div className="bg-white/50 border border-white/60 rounded-xl p-3 flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gray-105 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-black" />
          </div>
          <div>
            <h4 className="font-tech-label text-tech-label text-[#2d3748] mb-0.5">DANH SÁCH ĐỊA CHỈ NHẬN HÀNG LIÊN KẾT</h4>
            <p className="text-[#4a5568] leading-relaxed">Đây là địa chỉ nhận bưu kiện mặc định của bạn. Bạn có thể thay đổi nhanh bất kỳ lúc nào khi thanh toán đơn hàng.</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
