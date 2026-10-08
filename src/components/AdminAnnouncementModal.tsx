import { useState, useEffect } from "react";
import type { Announcement } from "../types/auth";

interface AdminAnnouncementModalProps {
  isOpen: boolean;
  announcement: Announcement;
  onSave: (announcement: Announcement) => void;
  onClose: () => void;
}

export function AdminAnnouncementModal({
  isOpen,
  announcement,
  onSave,
  onClose,
}: AdminAnnouncementModalProps) {
  const [active, setActive] = useState(announcement.active);
  const [badge, setBadge] = useState(announcement.badge);
  const [message, setMessage] = useState(announcement.message);
  const [linkText, setLinkText] = useState(announcement.linkText || "");

  useEffect(() => {
    setActive(announcement.active);
    setBadge(announcement.badge);
    setMessage(announcement.message);
    setLinkText(announcement.linkText || "");
  }, [announcement, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      active,
      badge: badge.trim() || "AVISO",
      message: message.trim(),
      linkText: linkText.trim(),
      updatedAt: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl border border-[#E2D9CC] flex flex-col">
        {/* Top aguayo strip */}
        <div className="aguayo-strip h-2 w-full" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#E8E3D8] bg-[#FAF7F2] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <h2 className="font-subtitle text-xl font-extrabold text-[#37474F]">
                Comunicado Oficial de la Llajta
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#6D4C41]">
              Este aviso se muestra en la cabecera del portal turístico para todos los visitantes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#6D4C41] hover:bg-[#D81B60] hover:text-white transition shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-[#FFF8EE] border border-[#FDE68A] p-3">
            <div>
              <p className="text-xs font-subtitle font-bold text-[#37474F]">
                Mostrar Comunicado en la Página
              </p>
              <p className="text-[11px] text-[#6D4C41]">
                Activa o desactiva la barra superior de avisos
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D81B60]"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
              Etiqueta del Comunicado
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="ej. NOVEDADES TURISMO"
              className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-xs text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
              Mensaje del Comunicado *
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe el aviso que verán los turistas..."
              className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-xs text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
              Texto de Botón / Enlace (Opcional)
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="ej. Ver agenda cultural"
              className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-xs text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#E2D9CC] bg-[#FAF7F2] py-2.5 text-xs font-subtitle font-bold text-[#6D4C41] hover:bg-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-[#D81B60] py-2.5 text-xs font-subtitle font-extrabold text-white shadow-lg shadow-[#D81B60]/30 hover:bg-[#b0144c] transition"
            >
              Publicar Comunicado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
