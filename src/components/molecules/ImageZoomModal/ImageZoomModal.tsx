import React, { useState, useEffect, useRef } from "react";
import { Icon } from "../../atoms/Icon/Icon";
import { Badge } from "../../atoms/Badge/Badge";

export interface ZoomModalData {
  src: string;
  title: string;
  area?: string;
  tag?: string;
  category?: string;
}

interface ImageZoomModalProps {
  isOpen: boolean;
  data: ZoomModalData | null;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ isOpen, data, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, zoomLevel]);

  if (!isOpen || !data) return null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      handleReset();
    } else {
      setZoomLevel(2);
    }
  };

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-xl text-white select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h2 className="font-subtitle text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <span>{data.title}</span>
              {data.tag && (
                <Badge variant="glass" size="sm" className="hidden sm:inline-flex">
                  {data.tag}
                </Badge>
              )}
            </h2>
            {data.area && (
              <span className="text-xs text-white/70 flex items-center gap-1 font-sans">
                <Icon name="pin" size={13} /> {data.area} · Cochabamba, Bolivia
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition text-white"
            title="Cerrar visor (Esc)"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </header>

      {/* Main Image Viewport */}
      <div
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 ${
          zoomLevel > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
          }}
          className="will-change-transform"
        >
          <img
            ref={imageRef}
            src={data.src}
            alt={data.title}
            className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl pointer-events-none ring-1 ring-white/10"
            draggable={false}
          />
        </div>

        {/* Tip helper */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 backdrop-blur-md px-4 py-1.5 text-[11px] font-subtitle font-bold text-white/80 border border-white/10 pointer-events-none">
          Doble clic para alternar zoom · Rueda para acercar/alejar · Arrastra para explorar
        </div>
      </div>

      {/* Bottom Floating Zoom Controls */}
      <footer className="px-6 py-4 flex items-center justify-center border-t border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-2xl">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition text-white"
            title="Alejar (-)"
          >
            <Icon name="zoom-out" size={18} />
          </button>

          <span className="px-3 font-subtitle text-xs font-bold min-w-[58px] text-center text-white/95">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3.5}
            className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition text-white"
            title="Acercar (+)"
          >
            <Icon name="zoom-in" size={18} />
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl hover:bg-white/15 font-subtitle text-xs font-bold transition text-white"
            title="Restablecer tamaño original (0)"
          >
            100%
          </button>
        </div>
      </footer>
    </div>
  );
};
