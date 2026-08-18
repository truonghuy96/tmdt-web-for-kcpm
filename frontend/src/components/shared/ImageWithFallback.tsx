import React, { useState } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc: string;
}

/**
 * Component hiển thị ảnh thông minh:
 * Ưu tiên tải `src` (ví dụ: URL từ ImageKit).
 * Nếu tải thất bại (hoặc lỗi kết nối/URL die), tự động nhảy về `fallbackSrc` (file local).
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      console.warn(`[IMAGEKIT FALLBACK] Không thể tải ảnh từ ImageKit (${imgSrc}), tự động chuyển về fallback local (${fallbackSrc})`);
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || ""}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
