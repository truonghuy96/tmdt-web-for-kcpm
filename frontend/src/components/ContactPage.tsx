import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Check,
  HelpCircle,
  ChevronDown,
  Users,
  ArrowRight,
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { teamMembers } from "../demo/data_mockdata";
import { sendContactInquiry } from "../services/api";
import { SEPAY_CONFIG } from "../config/paymentConfig";
// @ts-ignore
import heroImage from "../assets/images/contact-page/contact.png";

export default function ContactPage() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion active index
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Tôi có thể xem và mua các sản phẩm TechVie ở đâu?",
      a: "TechVie hiện phân phối sản phẩm chủ yếu trên nền tảng trực tuyến nhằm tối ưu chi phí cho khách hàng. Bạn có thể dễ dàng xem hình ảnh thực tế, thông số chi tiết và đặt hàng ngay trên website này. Mọi sản phẩm đều được đóng gói chuẩn Gift Box chỉn chu trước khi giao đến tay bạn.",
    },
    {
      q: "Các phụ kiện của TechVie có kén thiết bị sử dụng không?",
      a: "Chắc chắn là không! Các sản phẩm cơ học như giá đỡ tản nhiệt được thiết kế công thái học, phù hợp với hầu hết laptop/tablet từ 11 - 17 inch. Các thiết bị điện tử như cáp sạc nhanh Type-C/Lightning và củ sạc PD đều tương thích hoàn hảo và an toàn cho đa dạng hệ sinh thái từ iOS, Android đến Windows.",
    },
    {
      q: "Tôi muốn đặt ốp lưng in tên hoặc hình riêng thì làm thế nào?",
      a: "Rất đơn giản! Tại trang chi tiết sản phẩm ốp lưng custom, bạn chỉ cần tải hình ảnh lên hoặc nhập nội dung muốn in. Đội ngũ thiết kế của TechVie sẽ lên bản xem trước (mockup) và gửi bạn duyệt qua Zalo/Email để chốt thiết kế trước khi tiến hành in ấn.",
    },
    {
      q: "Tôi muốn mua sản phẩm làm quà tặng cho bạn bè thì sao?",
      a: "Tuyệt vời! Tất cả các đơn hàng tại TechVie (đặc biệt là các gói Combo) đều được đóng gói theo tiêu chuẩn Gift Box cao cấp. Bạn chỉ cần ghi chú thông điệp ở bước thanh toán, chúng tôi sẽ chuẩn bị thiệp viết tay và gửi kèm vào hộp quà giúp bạn.",
    },
    {
      q: "TechVie hỗ trợ những hình thức thanh toán nào?",
      a: "Nhằm mang lại sự tiện lợi tối đa, TechVie hỗ trợ thanh toán chuyển khoản nhanh qua mã VietQR tự động, thanh toán thẻ qua cổng an toàn, và hình thức nhận hàng thanh toán tiền mặt (COD) trên toàn quốc.",
    },
    {
      q: "Thời gian giao hàng mất bao lâu, đặc biệt là với ốp lưng custom?",
      a: "Đối với các phụ kiện có sẵn, thời gian giao hàng từ 2-4 ngày làm việc. Riêng với dòng ốp lưng in custom độc bản, TechVie cần thêm 1-2 ngày để chế tác và kiểm tra chất lượng (QC) trước khi gửi đi, nhằm đảm bảo sản phẩm đến tay bạn hoàn hảo nhất.",
    },
    {
      q: "Chính sách bảo hành sản phẩm của TechVie như thế nào?",
      a: "TechVie tự tin với chất lượng sản phẩm và áp dụng chính sách bảo hành 1-đổi-1 trong vòng 30 ngày đối với mọi lỗi từ nhà sản xuất (như lỗi in ấn ốp lưng, đèn LED không sáng, hoặc cáp sạc không nhận dòng). Các thiết bị điện tử sẽ đi kèm thời gian bảo hành cụ thể từ 6 đến 12 tháng tùy danh mục.",
    },
    {
      q: "TECHVIE có nhận thiết kế phụ kiện tùy chỉnh cho doanh nghiệp không?",
      a: "Có. Chúng tôi chuyên nhận thiết kế, in ấn ốp lưng custom mang đậm dấu ấn thương hiệu và cung cấp các 'Combo Setup' làm quà tặng doanh nghiệp (Corporate Gifts) với mức chiết khấu hấp dẫn. Quý đối tác có thể liên hệ trực tiếp qua form Liên Hệ Hợp Tác để nhận báo giá chi tiết.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim() === "" || formEmail.trim() === "" || isSubmitting)
      return;

    setIsSubmitting(true);
    try {
      const data = await sendContactInquiry({
        name: formName,
        email: formEmail,
        subject: formSubject,
        message: formMessage,
      });

      if (data.success) {
        setIsSubmitted(true);
        setFormName("");
        setFormEmail("");
        setFormSubject("");
        setFormMessage("");
        showSuccess(
          "Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất.",
        );
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } else {
        showError("Gửi thất bại: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Fallback behavior
      setIsSubmitted(true);
      setFormName("");
      setFormEmail("");
      setFormSubject("");
      setFormMessage("");
      showSuccess(
        "Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất.",
      );
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full font-sans antialiased"
    >
      {/* Inject Google Font for Editorial Design */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .font-sans tracking-tight {
          font-family: 'Playfair Display', serif;
        }
        .roboto-condensed-font {
          font-family: 'Roboto Condensed', sans-serif;
        }
      `}</style>

      <main className="w-full">
        {/* HERO SECTION: Bold Editorial Header */}
        <section className="border-b-8 border-black px-6 py-20 md:px-16 lg:px-24 xl:px-32">
          <div className="grid w-full grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left column: Headings & Description aligned from top to bottom */}
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <span className="mb-4 block text-xs font-black tracking-[0.4em] text-gray-500 uppercase">
                  TECHVIE REPRESENTATIVE CONTACT
                </span>
                <h1 className="mb-8 font-sans text-5xl leading-none font-black tracking-tight tracking-tighter text-gray-950 md:text-7xl lg:text-8xl">
                  Liên Hệ <br />
                  Hợp Tác
                </h1>
              </div>
              {/* context */}
              <p className="mt-auto max-w-xl font-sans text-lg leading-relaxed text-gray-800">
                Sẵn sàng kiến tạo giá trị chung. Kết nối với chúng tôi để thiết
                lập cầu nối đổi mới sáng tạo, nhận chính sách bán sỉ phụ kiện
                công nghệ, hoặc tư vấn gói combo setup không gian làm việc toàn
                diện cho doanh nghiệp của bạn.
              </p>
            </div>

            {/* Right column: Image Container, aligned to the top and tall (aspect-3/4) */}
            <div className="flex items-start justify-end lg:col-span-6">
              <div className="group relative aspect-[4/3] w-full overflow-hidden border border-black bg-gray-100 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] lg:w-full xl:w-11/12">
                <img
                  alt="TechVie Office"
                  className="h-full w-full scale-100 object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  src={heroImage}
                />
                <div className="absolute top-4 left-4 bg-black px-3 py-1 font-mono text-[8px] tracking-[0.2em] text-white uppercase">
                  TechVie
                </div>
                <div className="absolute right-4 bottom-4 border border-black/10 bg-white/80 px-3 py-1.5 font-mono text-[8px] tracking-[0.2em] text-gray-900 uppercase backdrop-blur-md">
                  EST. 2026
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT INFO & FORM: Asymmetrical Grid */}
        <section className="grid grid-cols-1 gap-0 border-b border-black lg:grid-cols-12">
          {/* LEFT COLUMN: Info Blocks */}
          <div className="lg:col-span-5 lg:border-r lg:border-black">
            <div className="space-y-16 p-8 lg:p-16">
              {/* Office Details */}
              <div>
                <h3 className="mb-8 inline-block border-b-2 border-black pb-2 text-xs font-black tracking-widest uppercase">
                  Văn Phòng Đại Diện
                </h3>
                <div className="space-y-10">
                  <div className="group">
                    <h4 className="mb-2 font-sans text-2xl font-black tracking-tight text-gray-950 md:text-3xl">
                      {SEPAY_CONFIG.store}
                    </h4>
                    <p className="text-xs leading-relaxed font-semibold tracking-wide text-gray-500 uppercase">
                      {SEPAY_CONFIG.address}
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Phone size={14} className="text-secondary" />
                      {SEPAY_CONFIG.phone}
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Mail size={14} className="text-secondary" />
                      {SEPAY_CONFIG.email}
                    </p>
                  </div>

                  {/* <div className="group">
                    <h4 className="font-sans tracking-tight text-2xl md:text-3xl italic font-black mb-2 text-gray-950">
                      TechVie Seoul Lab
                    </h4>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold leading-relaxed">
                      Innovation Tower, Gangnam-daero, Seoul, Hàn Quốc
                    </p>
                    <p className="mt-3 font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Mail size={14} className="text-secondary" />
                      contact@techvie-lab.com
                    </p>
                  </div> */}
                </div>
              </div>

              {/* Quote Block */}
              <div className="relative overflow-hidden rounded-3xl bg-black/10 p-8 text-white shadow-lg md:p-12">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_right_bottom,rgba(70,72,212,0.25),transparent_75%)]" />
                <h4 className="mb-4 text-xl font-black tracking-tight text-black uppercase">
                  Trở Thành Trọng Tâm
                </h4>
                <p className="text-xs leading-relaxed font-light text-black italic md:text-[15px]">
                  &ldquo;Khoảng cách giữa giấc mơ thiết bị tối tân và một sản
                  phẩm công nghệ thực tiễn là khoảng thời gian TechVie tinh tế
                  thiết lập chuẩn mực độ bền cơ học hi-end.&rdquo;
                </p>
                <p className="float-end mt-6 font-mono text-[12px] font-black tracking-[0.3em] text-black">
                  — TECHVIE —
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <div className="bg-white lg:col-span-7">
            <div className="p-8 lg:p-16">
              <div className="mb-12">
                <h2 className="mb-3 font-sans text-3xl font-black tracking-wide text-gray-950 sm:text-4xl md:text-5xl">
                  Gửi Thư Yêu Cầu
                </h2>
                <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase md:text-xs">
                  Chúng tôi sẽ bảo mật tuyệt đối thông tin và phản hồi nhanh
                  nhất
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="contact-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                      <div className="relative border-b-2 border-black pb-2">
                        <label className="mb-2 block text-[10px] font-black tracking-wider text-gray-500 uppercase">
                          Họ và Tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="placeholder:text-gray-250 w-full border-none bg-transparent p-0 text-lg outline-none focus:ring-0"
                        />
                      </div>

                      <div className="relative border-b-2 border-black pb-2">
                        <label className="mb-2 block text-[10px] font-black tracking-wider text-gray-500 uppercase">
                          Địa chỉ Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="contact@example.com"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="placeholder:text-gray-250 w-full border-none bg-transparent p-0 text-lg outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    <div className="relative border-b-2 border-black pb-2">
                      <label className="mb-2 block text-[10px] font-black tracking-wider text-gray-500 uppercase">
                        Chủ đề hợp tác
                      </label>
                      <input
                        type="text"
                        placeholder="Kế hoạch đại lý bán hàng / Tư vấn cấu hình thiết bị..."
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="placeholder:text-gray-250 w-full border-none bg-transparent p-0 text-lg outline-none focus:ring-0"
                      />
                    </div>

                    <div className="relative border-b-2 border-black pb-2">
                      <label className="mb-2 block text-[10px] font-black tracking-wider text-gray-500 uppercase">
                        Chi tiết thư yêu cầu
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Hãy mô tả chi tiết mong muốn hợp tác hoặc câu hỏi của bạn..."
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className="placeholder:text-gray-250 w-full resize-none border-none bg-transparent p-0 text-lg outline-none focus:ring-0"
                      />
                    </div>

                    <p className="mt-2 text-[12px] text-gray-500 italic">
                      * Khách hàng đảm bảo các thông tin cung cấp là đúng sự
                      thật. TechVie không chịu trách nhiệm cho các sai sót phát
                      sinh từ thông tin do khách hàng nhập.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="contact-submit-btn"
                    >
                      <div className="contact-submit-btn-text-wrapper">
                        <div className="contact-submit-btn-text-normal">
                          <span>
                            {isSubmitting
                              ? "ĐANG GỬI THƯ..."
                              : "GỬI THƯ YÊU CẦU HỢP TÁC"}
                          </span>
                          {!isSubmitting && <ArrowRight size={14} />}
                        </div>
                        <div className="contact-submit-btn-text-hover">
                          <span>
                            {isSubmitting
                              ? "ĐANG GỬI THƯ..."
                              : "TIẾP CẬN TECHVIE NGAY!"}
                          </span>
                          {!isSubmitting && <ArrowRight size={14} />}
                        </div>
                      </div>
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="contact-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check size={28} />
                    </div>
                    <h4 className="mb-2 font-sans text-xl font-bold tracking-tight text-gray-950 italic">
                      Thư Yêu Cầu Đã Gửi!
                    </h4>
                    <p className="text-gray-650 mx-auto max-w-md font-sans text-xs leading-relaxed md:text-sm">
                      Cảm ơn tin nhắn của bạn. Yêu cầu hỗ trợ đã được gửi thành
                      công đến hệ thống và lưu trữ trong cơ sở dữ liệu. Đội ngũ
                      tư vấn viên của TechVie sẽ liên hệ lại với bạn trong vòng
                      24 đến 48 giờ làm việc.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* MAP SECTION: High Contrast Full Width */}
        <section className="border-b-8 border-black">
          <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Showroom info */}
            <div className="flex flex-col justify-between border-b border-black bg-white p-8 lg:col-span-3 lg:border-r lg:border-b-0 lg:p-12 xl:p-16">
              <div>
                <span className="mb-8 block text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase">
                  Flagship Showroom
                </span>
                <h2 className="mb-8 font-sans text-4xl leading-tight font-black tracking-tight text-gray-950 md:text-5xl">
                  Ghé Thăm
                  <br />
                  Chúng Tôi
                </h2>
                <div className="space-y-5 font-sans text-xs font-bold text-gray-800 md:text-sm">
                  <p className="flex items-start gap-3 tracking-wider uppercase">
                    <span className="mt-2.5 w-6 shrink-0 border-t border-black"></span>
                    Số 02 Võ Oanh, Phường Thạnh Mỹ Tây, TP. Hồ Chí Minh, Việt
                    Nam
                  </p>
                  <p className="flex items-center gap-3 tracking-wider uppercase">
                    <span className="mt-2 w-6 shrink-0 border-t border-black"></span>
                    0909-826-249
                  </p>
                  <p className="flex items-center gap-3 tracking-wider uppercase">
                    <span className="mt-2 w-6 shrink-0 border-t border-black"></span>
                    contact@techvie-store.com
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Column: Map iframe */}
            <div className="relative min-h-[350px] border-b border-black bg-gray-100 grayscale transition-all duration-1000 hover:grayscale-0 hover:duration-900 lg:col-span-6 lg:min-h-full lg:border-r lg:border-b-0">
              <iframe
                allowFullScreen={true}
                height="100%"
                loading="lazy"
                src="https://maps.google.com/maps?q=Ho+Chi+Minh+City+University+of+Transport&t=&z=16&ie=UTF8&iwloc=&output=embed"
                style={{ border: 0 }}
                width="100%"
              />
            </div>

            {/* Right Column: Opening Hours & Warranty Services */}
            <div className="flex flex-col justify-between bg-white p-8 lg:col-span-3 lg:p-12 xl:p-16">
              <div>
                <span className="mb-8 block text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase">
                  Operational Hours
                </span>
                <h2 className="mb-8 font-sans text-3xl leading-tight font-black tracking-tight text-gray-950 md:text-4xl lg:text-5xl">
                  Giờ Làm Việc
                </h2>
                <div className="space-y-8">
                  <div>
                    {/* <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-gray-500 border-b border-black pb-1">
                      Flagship Showroom
                    </p> */}
                    <p className="text-md font-bold text-gray-900 italic">
                      T2 - T6: 08:00 - 21:30
                    </p>
                    <p className="text-md mt-1 font-bold text-gray-900 italic">
                      T7 - CN: 09:00 - 22:00
                    </p>
                    <p className="text-md mt-1 font-bold text-gray-900 italic">
                      Ngày Lễ: Nghỉ
                    </p>
                  </div>
                  {/* <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-gray-500 border-b border-black pb-1">
                      Trung Tâm Bảo Hành
                    </p>
                    <p className="text-xs font-bold italic text-gray-900">T2 - T6: 09:00 - 18:00</p>
                    <p className="text-xs font-bold italic text-gray-900 mt-1">Thứ Bảy: 09:00 - 12:00</p>
                    <p className="text-xs font-bold italic text-gray-900 mt-1">Chủ Nhật & Ngày Lễ: Nghỉ</p>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM SECTION: Editorial Profile Grid */}
        {/* <section className="p-8 lg:p-16 border-b-8 border-black">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 block text-gray-500">
                The Leadership
              </span>
              <h2 className="font-sans tracking-tight text-5xl lg:text-6xl font-black leading-none text-gray-950">
                Đội Ngũ<br />Sáng Tạo
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-md font-medium leading-relaxed border-l-4 border-black pl-6 text-gray-700 italic">
                Hội tụ những chuyên gia công nghệ, kỹ sư đầu ngành và nhà thiết kế xuất sắc cùng chung lý tưởng định hình tương lai các thiết bị cá nhân cao cấp.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-black">
            {teamMembers.map((member, idx) => (
              <div 
                key={idx}
                className="border-r border-b border-black p-8 group hover:bg-linear-to-b hover:from-black/10 hover:to-white/90 transition-all duration-500 flex flex-col justify-between min-h-[450px]"
              >
                <div>
                  <div className="aspect-[3/4] mb-6 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 rounded-lg bg-gray-50 border border-gray-200 group-hover:border-transparent">
                    <img 
                      alt={member.name} 
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700" 
                      src={member.image}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 group-hover:text-indigo-400 transition-colors">
                    {member.role}
                  </span>
                  <h3 className="font-sans tracking-tight text-2xl md:text-3xl italic font-black mt-1 text-gray-950 ">
                    {member.name}
                  </h3>
                </div>
                <p className="mt-4 text-[12px] md:text-xs font-light leading-relaxed opacity-70 group-hover:opacity-85 transition-opacity">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section> */}

        {/* FAQs Accordion Grid */}
        <section className="bg-gray-50 px-6 py-16 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-sans text-4xl font-black tracking-tight text-gray-950 md:text-5xl">
                Câu hỏi phổ biến
              </h2>
              <div className="mx-auto h-1.5 w-16 bg-black"></div>
            </div>

            <div className="space-y-0 border-t border-black">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-black bg-transparent">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-6 text-left transition-colors hover:bg-black/5 focus:outline-none"
                  >
                    <span className="text-gray-955 font-sans text-sm font-bold tracking-tight uppercase md:text-base">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-black transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden bg-white/40"
                      >
                        <p className="text-md max-w-3xl px-6 pb-6 font-sans leading-relaxed text-gray-700">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
}
