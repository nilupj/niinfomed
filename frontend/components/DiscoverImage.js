
import Image from 'next/image';
export const runtime = "edge";
/**
 * Google Discover Optimized Image Component
 * 
 * Requirements for Google Discover:
 * - Image width ≥ 1200px
 * - Format: WebP or JPG
 * - No watermarks or text overlays
 * - High quality, natural images
 * - 16:9 aspect ratio recommended (1200x675)
 */
export default function DiscoverImage({ 
  src, 
  alt, 
  width = 1200, 
  height = 675,
  priority = false,
  className = ""
}) {
  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
        className="object-cover"
        priority={priority}
        quality={90}
      />
    </div>
  );
}
