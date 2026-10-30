import React, { useState, useRef, useCallback } from "react";
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
        src={src}
        alt={alt}
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
