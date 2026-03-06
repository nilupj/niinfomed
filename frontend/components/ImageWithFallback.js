// components/ImageWithFallback.js
import { useState, useEffect } from 'react';
import { getProxiedImageUrl } from '../utils/api';

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  priority = false,
  fallbackSrc = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&h=630&q=75',
  ...props 
}) {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(getProxiedImageUrl(src));

  useEffect(() => {
    setImageSrc(getProxiedImageUrl(src));
    setError(false);
  }, [src]);

  const handleError = () => {
    setError(true);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  if (error && imageSrc === fallbackSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`} 
        style={{ width, height }}
        aria-label="Image placeholder"
      >
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt || "Image"}
      className={className}
      width={width}
      height={height}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...props}
    />
  );
}
