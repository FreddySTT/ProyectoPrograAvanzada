import React, { useState, useRef, useCallback, useEffect } from "react";
import { Icon } from "../Icon/Icon";

interface ZoomImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onZoomClick?: () => void;
  showZoomBadge?: boolean;
  aspectRatio?: string;
  zoomScale?: number;
}

const FALLBACK_HERO = "/assets/cochabamba-hero.jpg";
const FALLBACK_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%230F172A' width='600' height='400'/%3E%3Cpath fill='%23BE123C' d='M0 340l140-180 100 100 130-150 230 230H0z' opacity='0.8'/%3E%3Cpath fill='%23F4C430' d='M160 400l110-120 90 90 120-130 120 160H160z' opacity='0.6'/%3E%3Ccircle cx='480' cy='110' r='36' fill='%23F59E0B' opacity='0.9'/%3E%3Ctext x='300' y='365' font-family='sans-serif' font-size='22' font-weight='800' fill='%23FFFFFF' text-anchor='middle'%3ERiqsi Rutas Â· Cochabamba%3C/text%3E%3C/svg%3E";

export const ZoomImage: React.FC<ZoomImageProps> = ({
  src,
  alt,
  className = "h-full w-full object-cover",
  containerClassName = "relative h-56 overflow-hidden group cursor-crosshair select-none",
  onZoomClick,
  showZoomBadge = true,
  zoomScale = 1.9,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_HERO);
  const [hasErrorOnce, setHasErrorOnce] = useState(false);

  useEffect(() => {
    setImgSrc(src || FALLBACK_HERO);
    setHasErrorOnce(false);
  }, [src]);

  const handleImgError = useCallback(() => {
    if (!hasErrorOnce) {
      setHasErrorOnce(true);
      setImgSrc(FALLBACK_HERO);
    } else {
      setImgSrc(FALLBACK_SVG);
    }
  }, [hasErrorOnce]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setOrigin({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setOrigin({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onZoomClick?.()}
      title="Pasa el cursor para zoom dinámico o haz clic para ver en pantalla completa"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onZoomClick) {
          e.preventDefault();
          onZoomClick();
        }
      }}
    >
      {/* Dynamic Cursor Magnifier Zoom Image */}
      <img
        src={imgSrc}
        alt={alt}
        onError={handleImgError}
        className={`${className} will-change-transform`}
        style={{
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transform: isHovered ? `scale(${zoomScale})` : "scale(1)",
          transition: isHovered
            ? "transform 0.15s ease-out, transform-origin 0.05s ease-out"
            : "transform 0.4s ease-out, transform-origin 0.4s ease-out",
        }}
        loading="lazy"
      />

      {/* Floating Zoom Indicator Badge */}
      {showZoomBadge && (
        <div
          className={`absolute bottom-3 right-3 z-10 transition-all duration-300 pointer-events-none ${
            isHovered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
          }`}
        >
          <div className="flex items-center gap-1.5 rounded-full bg-[#1E293B]/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-subtitle font-black text-white shadow-xl border border-white/25">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#D81B60] text-white">
              <Icon name="zoom" size={11} />
            </span>
            <span>Zoom activo · Clic para ampliar</span>
          </div>
        </div>
      )}

      {/* Subtle Crosshair Reticle on Hover */}
      {isHovered && (
        <div
          className="pointer-events-none absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 shadow-[0_0_12px_rgba(216,27,96,0.8)] backdrop-invert-[.15]"
          style={{
            left: `${origin.x}%`,
            top: `${origin.y}%`,
            transition: "left 0.05s ease-out, top 0.05s ease-out",
          }}
        />
      )}
    </div>
  );
};
