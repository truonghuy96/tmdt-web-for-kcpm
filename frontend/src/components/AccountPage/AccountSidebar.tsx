import {
  User,
  BadgeCheck,
  QrCode,
  History,
  Laptop,
  Settings,
  LogOut,
  ShieldAlert,
} from "lucide-react";

interface AccountSidebarProps {
  userProfile: any;
  accountTab: "profile" | "orders" | "devices" | "security";
  setAccountTab: (tab: "profile" | "orders" | "devices" | "security") => void;
  ordersCount: number;
  handleLogout: () => void;
  onNavigate?: (tab: string) => void;
}

export default function AccountSidebar({
  userProfile,
  accountTab,
  setAccountTab,
  ordersCount,
  handleLogout,
  onNavigate,
}: AccountSidebarProps) {
  const isVerified =
    userProfile.authProvider === "google" ||
    userProfile.isEmailVerified ||
    !!localStorage.getItem("verified_email_" + userProfile.email);

  return (
    <div className="gap-stack-gap flex flex-col lg:col-span-4">
      {/* User Master Visual ID Card */}
      <div className="group relative overflow-hidden rounded-xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-col items-center space-y-3 text-center">
          {/* Avatar */}
          <div className="relative mt-1">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white/80 shadow-inner transition-colors duration-500 group-hover:border-gray-400">
              <User size={32} className="text-[#4a5568]" />
            </div>

            {/* Email Verification Status (Bottom-Right) */}
            {isVerified ? (
              <span
                className="absolute right-0 bottom-0 drop-shadow-sm text-blue-500 rounded-full bg-white"
                title="Tài khoản đã xác thực email"
              >
                <BadgeCheck size={18} />
              </span>
            ) : (
              <span
                className="absolute right-0 bottom-0 animate-pulse rounded-full bg-white text-amber-500 drop-shadow-sm"
                title="Tài khoản chưa xác thực email"
              >
                <ShieldAlert size={18} />
              </span>
            )}
          </div>

          {/* Name & Details */}
          <div className="space-y-0.5">
            <h2 className="font-headline-md text-headline-md flex items-center justify-center gap-2 tracking-wider text-[#2d3748] uppercase">
              {userProfile.name}
            </h2>
            <p className="font-tech-label text-tech-label text-[#4a5568]">
              MÃ SỐ: {userProfile.techvieId}
            </p>
          </div>

          {/* Visual QR Code Area */}
          {/* <div className="w-full mt-2.5 p-3 bg-white/50 border border-white/60 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2d3748] rounded flex items-center justify-center flex-shrink-0">
              <QrCode size={20} className="text-white" />
            </div>
            <div className="text-left flex-grow">
              <span className="block font-tech-label text-tech-label text-[#2d3748]">SHOWROOM ID</span>
              <span className="block font-caption-tiny text-caption-tiny text-[#4a5568] mt-0.5">Quét mã nhận diện thành viên</span>
            </div>
          </div> */}
        </div>

        {/* Metadata */}
        <div className="mt-4 flex flex-col gap-1.5 border-t border-white/60 pt-3 font-sans text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#4a5568]">Thành viên từ:</span>
            <span className="font-tech-label text-tech-label !text-sm !tracking-normal">
              {userProfile.memberSince}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#4a5568]">Đặc quyền:</span>
            <span
              className={`font-tech-label text-tech-label border-none !text-sm !tracking-normal ${
                userProfile.shieldStatus === "Đang Kích Hoạt (Premium)" ||
                userProfile.shieldStatus === "Premium"
                  ? "text-emerald-700"
                  : "text-blue-700"
              }`}
            >
              {userProfile.shieldStatus || "Standard"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sidebar */}
      <nav className="flex flex-col gap-1 rounded-xl border border-white/60 bg-white/60 p-2 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => setAccountTab("profile")}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all ${
            accountTab === "profile"
              ? "border border-white/60 bg-white/80 text-black shadow-md"
              : "border border-transparent text-[#4a5568] hover:bg-white/40 hover:text-black hover:shadow-sm"
          }`}
        >
          <User size={18} />
          <span className="font-headline-sm text-[13px] font-bold tracking-widest uppercase">
            Hồ sơ cá nhân
          </span>
          {accountTab === "profile" && (
            <div className="ml-auto h-5 w-[3px] rounded-full bg-black" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setAccountTab("orders")}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all ${
            accountTab === "orders"
              ? "border border-white/60 bg-white/80 text-black shadow-md"
              : "border border-transparent text-[#4a5568] hover:bg-white/40 hover:text-black hover:shadow-sm"
          }`}
        >
          <History size={18} />
          <span className="font-headline-sm text-[13px] font-bold tracking-widest uppercase">
            Lịch sử đặt hàng
          </span>
          {ordersCount > 0 && (
            <span
              className={`font-tech-label text-tech-label bg-gray-150 rounded px-2 py-0.5 text-black ${accountTab === "orders" ? "ml-2" : "ml-auto"}`}
            >
              {ordersCount}
            </span>
          )}
          {accountTab === "orders" && (
            <div className="ml-auto h-5 w-[3px] rounded-full bg-black" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setAccountTab("devices")}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all ${
            accountTab === "devices"
              ? "border border-white/60 bg-white/80 text-black shadow-md"
              : "border border-transparent text-[#4a5568] hover:bg-white/40 hover:text-black hover:shadow-sm"
          }`}
        >
          <Laptop size={18} />
          <span className="font-headline-sm text-[13px] font-bold tracking-widest uppercase">
            Bảo hành sản phẩm
          </span>
          {accountTab === "devices" && (
            <div className="ml-auto h-5 w-[3px] rounded-full bg-black" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setAccountTab("security")}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all ${
            accountTab === "security"
              ? "border border-white/60 bg-white/80 text-black shadow-md"
              : "border border-transparent text-[#4a5568] hover:bg-white/40 hover:text-black hover:shadow-sm"
          }`}
        >
          <Settings size={18} />
          <span className="font-headline-sm text-[13px] font-bold tracking-widest uppercase">
            Cài đặt bảo mật
          </span>
          {accountTab === "security" && (
            <div className="ml-auto h-5 w-[3px] rounded-full bg-black" />
          )}
        </button>

        <div className="my-2 h-px w-full bg-white/60" />

        {userProfile?.role === "admin" && onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate("admin")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-indigo-500 px-4 py-3 text-indigo-100 transition-all duration-300 hover:bg-indigo-700 hover:shadow-sm"
          >
            <ShieldAlert size={18} />
            <span className="font-headline-sm text-[13px] font-extrabold tracking-widest uppercase">
              Quản trị hệ thống
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition-all duration-300 hover:bg-red-50 hover:shadow-sm"
        >
          <LogOut size={18} />
          <span className="font-headline-sm text-[13px] font-bold tracking-widest uppercase">
            Đăng xuất
          </span>
        </button>
      </nav>
    </div>
  );
}
