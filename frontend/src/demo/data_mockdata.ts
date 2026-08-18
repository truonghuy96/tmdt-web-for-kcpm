import { Product, NewsArticle, TimelineEvent, TeamMember } from "../types";

// @ts-ignore
import blog1 from "../assets/blog/blog_1.png";
// @ts-ignore
import blog2 from "../assets/blog/blog_2.png";
// @ts-ignore
import blog3 from "../assets/blog/blog_3.png";

const laptopImg =
  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80";

export const products: Product[] = [
  {
    id: "techvie-phone-1",
    name: "Điện Thoại TechVie Ultra v1",
    price: 28990000,
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    category: "Điện thoại",
    stock: 12,
    description:
      "Chiếc flagship siêu phẩm tích hợp màn hình Dynamic OLED dải màu vô hạn kết hợp Camera cảm biến ống kính TechVie Pro. Khung vỏ bằng chất liệu Titanium nguyên khối cho trọng lượng siêu nhẹ và chuẩn bền bỉ vượt trội.",
    specs: [
      { label: "Màn hình", value: '6.7" Dynamic OLED 120Hz' },
      { label: "Vi xử lý", value: "TechVie Core Pro Alpha" },
      { label: "Dung lượng Pin", value: "5000 mAh (Sạc siêu tốc)" },
      { label: "Hệ thống Camera", value: "50MP Tri-Lens v2" },
    ],
  },
  {
    id: "techvie-book-pro",
    name: "Laptop TechVie Book Pro X",
    price: 42500000,
    image: laptopImg,
    category: "Laptop",
    stock: 8,
    description:
      "Trạm làm việc di động tối thượng dành cho các nhà sáng tạo nội dung và kỹ sư lập trình. Thiết kế siêu mỏng nhẹ từ hợp kim nhôm tái chế cao cấp, âm thanh phòng thu 6 loa vòm và bàn phím hành trình sâu êm ái.",
    specs: [
      { label: "Bộ xử lý", value: "TechVie Silicon M1 Ultra" },
      { label: "Bộ nhớ RAM", value: "32GB Unified RAM" },
      { label: "Lưu trữ SSD", value: "1TB NVMe Gen 4" },
      { label: "Thời lượng Pin", value: "Lên tới 20 giờ liên tục" },
    ],
  },
  {
    id: "techvie-watch-ultra",
    name: "Đồng Hồ TechVie Watch Ultra",
    price: 19500000,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    category: "Đồng hồ",
    stock: 3,
    description:
      "Người đồng hành thầm lặng cho mọi cuộc phiêu lưu khắc nghiệt và bảo trợ sức khỏe toàn thời gian. Khung vỏ Titanium chống ăn mòn cấp độ vũ trụ, hệ thống định vị GPS băng kép độc lập và kính Sapphire chống xước tuyệt đối.",
    specs: [
      { label: "Kích thước mặt", value: "49mm Titanium Gasket" },
      { label: "Định vị toàn cầu", value: "GPS Băng tần kép L1+L5" },
      { label: "Chống nước", value: "WR100 (Sâu tới 100m)" },
      {
        label: "Cảm biến sức khỏe",
        value: "Nhịp tim, ECG & SpO2 cấp phòng khám",
      },
    ],
  },
  {
    id: "techvie-buds-2",
    name: "Tai Nghe Sound Buds Pro v2",
    price: 6800000,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    category: "Âm thanh",
    stock: 0,
    description:
      "Không gian âm nhạc phòng thu hoàn toàn riêng biệt bất cứ nơi đâu nhờ công nghệ chống ồn chủ động thích ứng ANC thông minh mới nhất lên đến 48dB. Tái tạo chất âm trung thực, âm bass tròn đầy, ấm áp.",
    specs: [
      { label: "Kháng nhiễu chủ động", value: "ANC 48dB Adaptive" },
      { label: "Trình điều khiển", value: "Dynamic Driver 11mm Dual" },
      { label: "Pin hộp sạc", value: "36 giờ cả hộp (Sạc không dây)" },
      { label: "Độ trễ truyền tải", value: "Cực thấp 20ms (Chế độ Gaming)" },
    ],
  },
  {
    id: "techvie-keyboard-zen",
    name: "Bàn Phím Cơ TechVie ZenBoard v2",
    price: 4900000,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    category: "Bàn phím",
    stock: 25,
    description:
      "Nâng tầm trải nghiệm gõ phím nhẹ nhàng và thư giãn mỗi ngày. Khung kim loại nguyên khối CNC tỉ mỉ, cấu trúc Gasket-mount 5 lớp triệt tiêu mọi tạp âm, switch mượt mà được lube sẵn bằng dầu chất lượng Thụy Sĩ.",
    specs: [
      { label: "Cấu trúc phím", value: "Gasket Mount CNC Aluminum" },
      {
        label: "Kiểu kết nối",
        value: "3 Chế độ (Type-C / Bluetooth / 2.4Ghz)",
      },
      { label: "Keycaps", value: "Double-shot PBT Profile Zen" },
      { label: "Tính năng nâng cao", value: "Hot-swap 5-pin, Hỗ trợ QMK/VIA" },
    ],
  },
];

export const newsArticles: NewsArticle[] = [
  {
    id: "techvie-blog-01",
    title: "Tuyệt Chiêu Giấu Dây Cáp Gọn Gàng Cho Góc Làm Việc Minimalist",
    category: "Setup Tips",
    date: "20 Tháng 6, 2026",
    image: blog1,
    summary:
      "Dây điện chằng chịt luôn là kẻ thù của một góc học tập aesthetic. Khám phá ngay 3 bước đơn giản để giấu hoàn toàn dây cáp, trả lại không gian tối giản cho bạn.",
    content:
      "Một góc làm việc lộn xộn sẽ làm giảm đáng kể cảm hứng học tập và sự tập trung. Việc đầu tiên để có một không gian chuẩn aesthetic chính là quy hoạch lại hệ thống dây điện. Bạn có thể sử dụng các khay đi dây kẹp dưới mặt bàn kết hợp cùng dây rút velcro để cố định các cáp sạc, dây nguồn. Đừng quên trang bị thêm các loại cáp sạc nhanh bọc dù từ TechVie để vừa tăng độ bền, vừa chống rối hiệu quả.",
  },
  {
    id: "techvie-blog-02",
    title:
      "Hướng Dẫn Chọn Ốp Lưng Custom: Chất Liệu Nào Chống Ố Vàng Tốt Nhất?",
    category: "Product Guide",
    date: "15 Tháng 6, 2026",
    image: blog2,
    summary:
      "Sở hữu một chiếc ốp lưng in hình cá nhân là cách tuyệt vời để thể hiện chất riêng. Nhưng làm sao để chọn được chất liệu ốp vừa bảo vệ máy, vừa bền màu?",
    content:
      "Ốp lưng trong suốt thường gặp phải tình trạng ố vàng sau một thời gian sử dụng do tác động của tia UV và mồ hôi tay. Tại TechVie, các sản phẩm ốp lưng custom được ưu tiên sử dụng mặt lưng PC (Polycarbonate) cứng kết hợp viền TPU dẻo cao cấp. Sự kết hợp này không chỉ giúp giảm chấn động khi va đập mà còn giữ được độ trong suốt bền lâu, làm nổi bật sắc nét từng chi tiết hình ảnh mà bạn đã thiết kế.",
  },
  {
    id: "techvie-blog-03",
    title: "5 Phụ Kiện Không Thể Thiếu Cho Góc Học Tập Công Thái Học",
    category: "Lifestyle",
    date: "10 Tháng 6, 2026",
    image: blog3,
    summary:
      "Đầu tư vào không gian học tập khoa học là khoản đầu tư sinh lời nhất cho sức khỏe và hiệu suất. Điểm mặt 5 'trợ thủ' đắc lực giúp bạn nói không với đau mỏi vai gáy.",
    content:
      "Xu hướng học tập và làm việc cường độ cao đòi hỏi chúng ta phải quan tâm nhiều hơn đến sức khỏe thể chất. Hãy bắt đầu từ việc trang bị một chiếc giá đỡ laptop tản nhiệt để nâng tầm nhìn ngang mắt, hạn chế việc phải cúi gập cổ. Tiếp đó, một chiếc đèn LED kẹp màn hình hoặc đèn decor RGB sẽ giúp giảm tình trạng mỏi mắt khi làm việc ban đêm, đồng thời tăng gấp đôi cảm hứng sáng tạo cho góc làm việc của bạn.",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    year: "2020",
    title: "Khởi đầu Studio tại Lausanne",
    description:
      "Một đội ngũ kỹ sư phần cứng xuất sắc tại Thụy Sĩ khởi động dự án TechVie Lab, nghiên cứu chế tác các linh kiện vi mạch siêu bền bỉ phục vụ công nghiệp thiết bị đeo thông minh.",
  },
  {
    year: "2022",
    title: "Chào sân chiếc Smartphone đầu tiên",
    description:
      "TechVie Phone v1 chính thức trình làng tại triển lãm công nghệ BaselWorld, đánh dấu ngôn ngữ thiết kế viền mỏng vô hạn cùng công nghệ tản nhiệt buồng hơi lỏng độc lập.",
  },
  {
    year: "2024",
    title: "Mở rộng dải sinh thái phong phú",
    description:
      "Ra mắt dòng Laptop TechVie Book và tai nghe Sound Buds chống ồn siêu cấp, mở rộng trung tâm sản xuất bán dẫn phụ trợ tại quốc gia dẫn đầu công nghệ Seoul, Hàn Quốc.",
  },
  {
    year: "2026",
    title: "Kỷ nguyên Đồng bộ TechVie Ecosystem",
    description:
      "Hoàn thiện hệ sinh thái thông minh hoàn hảo từ điện thoại, máy tính, đồng hồ thông minh kết nối liền mạch bằng hạ tầng mật mã bảo mật hai chiều AES-256 an toàn tối thượng.",
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: "GS. Minh Trí",
    role: "Founder & Giám đốc Công nghệ",
    bio: "Cựu chuyên viên nghiên cứu vi kiến trúc bán dẫn tại Lausanne, Thụy Sĩ. Ông đã dành hơn 15 năm thiết kế sơ đồ liên kết của các bo mạch siêu gọn và dẫn dắt định hướng thiết bị phần cứng của TechVie.",
    image: "https://picsum.photos/seed/tri/400/400",
  },
  {
    name: "Diệu Linh",
    role: "Chief of Product Design",
    bio: "Nhà thiết kế tiên phong với tầm nhìn giao thoa phong cách tối giản Bắc Âu và tính thực dụng tiện nghi. Cô là người trực tiếp chắp bút cho bộ khung Titanium siêu mỏng thanh lịch đặc trưng của TECHVIE.",
    image: "https://picsum.photos/seed/linh/400/400",
  },
  {
    name: "TS. Seung-Min Kim",
    role: "Chủ nhiệm Phát triển Mạch Tích Hợp",
    bio: "Chuyên gia cao cấp về kỹ thuật tần số siêu cao. Ông chịu trách nhiệm chính trong việc tối ưu hóa hiệu suất điện năng và độ trễ phản hồi của hệ thống loa âm thanh Bluetooth của hãng.",
    image: "https://picsum.photos/seed/kim/400/400",
  },
  {
    name: "Alexandra Dubois",
    role: "Giám đốc Chuỗi cung ứng Toàn cầu",
    bio: "Hơn 12 năm kinh nghiệm điều phối quy trình cung ứng linh kiện hi-end tại Thụy Sĩ và Đức. Đảm bảo nguồn tài nguyên nhôm tái chế sạch và kính sapphire đạt chuẩn quân sự khắt khe nhất.",
    image: "https://picsum.photos/seed/alexandra/400/400",
  },
  {
    name: "Bảo Long",
    role: "Trưởng phòng Trải nghiệm Người dùng",
    bio: "Cựu kỹ sư tại Silicon Valley, phụ trách xây dựng tính tương tác không độ trễ của giao diện TechVieOS và nâng tầm khả năng đồng bộ hóa sinh trắc học thông minh trên hệ sinh thái.",
    image: "https://picsum.photos/seed/baolong/400/400",
  },
  {
    name: "Tuấn Kiệt",
    role: "Kỹ sư trưởng Vật liệu Siêu bền",
    bio: "Chuyên gia hàng đầu về kỹ thuật gia công lớp phủ anodized và tôi luyện thủy tinh cường lực. Người bảo đảm độ bền cơ học vững chãi vượt qua mọi thử thách va chạm khắc nghiệt nhất.",
    image: "https://picsum.photos/seed/tuankiet/400/400",
  },
  {
    name: "Dr. Evelyn Vance",
    role: "Giám đốc Nghiên cứu TechVieOS",
    bio: "Tiến sĩ Khoa học Máy tính từ MIT, chuyên sâu trong thiết kế vi hạt nhân tối giản và cơ chế mã hóa bảo mật phần cứng hai chiều AES-256 giúp bảo vệ thông tin thông minh tối thượng.",
    image: "https://picsum.photos/seed/evelyn/400/400",
  },
  {
    name: "Mai Phương",
    role: "Giám đốc Chăm sóc Khách hàng Premium",
    bio: "Quản lý chuỗi Trạm trải nghiệm cao cấp trên toàn quốc. Cô tập trung kiến tạo văn hóa hỗ trợ kỹ thuật tận tâm trọn đời và tổ chức các chương trình đặc quyền dành riêng cho khách VIP.",
    image: "https://picsum.photos/seed/maiphuong/400/400",
  },
];
