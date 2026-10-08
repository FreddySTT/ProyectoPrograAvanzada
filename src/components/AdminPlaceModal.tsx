import { useState, useEffect } from "react";
import type { PlaceItem } from "../types/auth";
import { AVAILABLE_PHOTO_PRESETS } from "../data/initialData";

interface AdminPlaceModalProps {
  isOpen: boolean;
  editingPlace: PlaceItem | null;
  onSave: (place: PlaceItem) => void;
  onClose: () => void;
}

export function AdminPlaceModal({
  isOpen,
  editingPlace,
  onSave,
  onClose,
}: AdminPlaceModalProps) {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [tag, setTag] = useState("Imperdible");
  const [category, setCategory] = useState<"cultura" | "naturaleza" | "gastronomia" | "aventura">("cultura");
  const [image, setImage] = useState(AVAILABLE_PHOTO_PRESETS[0].url);
  const [rating, setRating] = useState("4.9");
  const [time, setTime] = useState("2–3 h");
  const [featured, setFeatured] = useState(false);
  const [customImage, setCustomImage] = useState("");

  useEffect(() => {
    if (editingPlace) {
      setTitle(editingPlace.title);
      setArea(editingPlace.area);
      setTag(editingPlace.tag);
      setCategory(editingPlace.category);
      setImage(editingPlace.image);
      setRating(editingPlace.rating);
      setTime(editingPlace.time);
      setFeatured(!!editingPlace.featured);
      setCustomImage("");
    } else {
      setTitle("");
      setArea("");
      setTag("Imperdible");
      setCategory("cultura");
      setImage(AVAILABLE_PHOTO_PRESETS[0].url);
      setRating("4.9");
      setTime("2–3 h");
      setFeatured(false);
      setCustomImage("");
    }
  }, [editingPlace, isOpen]);

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
    if (!title.trim() || !area.trim()) return;

    const finalImage = customImage.trim() || image;

    const savedItem: PlaceItem = {
      id: editingPlace ? editingPlace.id : `place-${Date.now()}`,
      title: title.trim(),
      area: area.trim(),
      tag: tag.trim() || "Destacado",
      category,
      image: finalImage,
      rating: rating.trim() || "5.0",
      time: time.trim() || "2 h",
      featured,
      visible: true,
    };

    onSave(savedItem);
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
      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl border border-[#E2D9CC] flex flex-col max-h-[92vh]">
        {/* Top aguayo strip */}
        <div className="aguayo-strip h-2 w-full" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#E8E3D8] bg-[#FAF7F2] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏔️</span>
              <h2 className="font-subtitle text-xl font-extrabold text-[#37474F]">
                {editingPlace ? "Editar Destino Turístico" : "Aumentar Nueva Ruta / Destino"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#6D4C41]">
              Administra el contenido turístico que verán los visitantes de Cochabamba.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#6D4C41] hover:bg-[#D81B60] hover:text-white transition shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
              Nombre del Lugar / Experiencia *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Mirador de San Pedro & Teleférico"
              className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                Zona / Ubicación *
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="ej. Tiquipaya, Cala Cala..."
                className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] font-subtitle font-bold focus:border-[#D81B60] focus:bg-white focus:outline-none"
              >
                <option value="cultura">Cultura</option>
                <option value="naturaleza">Naturaleza</option>
                <option value="gastronomia">Gastronomía</option>
                <option value="aventura">Aventura</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                Etiqueta / Tag
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="ej. Imperdible"
                className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                Duración sugerida
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="ej. 2–3 h"
                className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                Puntuación (★)
              </label>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="ej. 4.9"
                className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Toggle Destacado */}
          <div className="flex items-center justify-between rounded-xl bg-[#FFF8EE] border border-[#FDE68A] p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <div>
                <p className="text-xs font-subtitle font-bold text-[#37474F]">
                  Seleccionar como Destacado
                </p>
                <p className="text-[11px] text-[#6D4C41]">
                  Aparecerá con distintivo dorado especial en el catálogo
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7931E]"></div>
            </label>
          </div>

          {/* Selector de Fotografía */}
          <div>
            <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1.5">
              Imagen del Destino
            </label>
            <p className="text-[11px] text-[#6D4C41] mb-2">
              Selecciona una fotografía del archivo local de Cochabamba o escribe una URL:
            </p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {AVAILABLE_PHOTO_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => {
                    setImage(preset.url);
                    setCustomImage("");
                  }}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition ${
                    image === preset.url && !customImage
                      ? "border-[#D81B60] ring-2 ring-[#D81B60]/30 scale-105"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  title={preset.name}
                >
                  <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white p-0.5 truncate text-center">
                    {preset.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>

            <input
              type="url"
              value={customImage}
              onChange={(e) => setCustomImage(e.target.value)}
              placeholder="O pega URL de imagen externa (opcional)"
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
              {editingPlace ? "Guardar Cambios" : "Aumentar Destino"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
