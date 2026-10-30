import React from "react";
import { Icon } from "../Icon/Icon";

interface ZoomImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onZoomClick?: () => void;
  showZoomBadge?: boolean;
}

export const ZoomImage: React.FC<ZoomImageProps> = ({
  src,
  alt,
  className = "h-full w-full object-cover",
  containerClassName = "relative h-56 overflow-hidden group cursor-pointer",
  onZoomClick,
  showZoomBadge = true,
}) => {
  return (
    <div
      className={containerClassName}
      onClick={() => onZoomClick && onZoomClick()}
      title="Haz clic para ampliar con zoom interactivo"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onZoomClick) {
          e.preventDefault();
          onZoomClick();
        }
      }}
    >
      <img
        src={src}
        alt={alt}
        className={`${className} transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform`}
        loading="lazy"
      />

      {/* Hover Lens & Zoom Prompt */}
      {showZoomBadge && (
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 scale-90 group-hover:scale-100 rounded-full bg-black/70 backdrop-blur-md px-4 py-2 font-subtitle text-xs font-extrabold text-white shadow-2xl border border-white/30 flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#D81B60] text-white">
              <Icon name="zoom" size={13} />
            </span>
            <span>Ver con Zoom</span>
          </div>
        </div>
      )}
    </div>
  );
};
