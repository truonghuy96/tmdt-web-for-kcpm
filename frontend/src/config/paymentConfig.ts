export const SEPAY_CONFIG = {
  bank: "BIDV",
  acc: "962475NG6A",
  holder: "TRAN TRUNG NAM",
  store: "TechVie Store",
  template: "compact",
  showinfo: "false",
  address: "02 Võ Oanh, Phường Thạnh Mỹ Tây, TP. Hồ Chí Minh, Việt Nam",
  phone: "0909-826-249",
  email: "contact@techvie-store.com",
  vat: "0123456789",
};

/**
 * Tự động sinh URL VietQR động theo các tham số cấu hình tập trung
 * @param amount Số tiền chuyển khoản
 * @param description Nội dung chuyển khoản
 */
export function generateVietQrUrl(amount: number, description: string): string {
  const params = new URLSearchParams({
    bank: SEPAY_CONFIG.bank,
    acc: SEPAY_CONFIG.acc,
    template: SEPAY_CONFIG.template,
    amount: amount.toString(),
    des: description,
    showinfo: SEPAY_CONFIG.showinfo,
    holder: SEPAY_CONFIG.holder,
    store: SEPAY_CONFIG.store,
  });

  return `https://vietqr.app/img?${params.toString()}`;
}
