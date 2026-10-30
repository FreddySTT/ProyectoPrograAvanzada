import React from "react";
import { Icon } from "../../atoms/Icon/Icon";
import { Badge } from "../../atoms/Badge/Badge";
import { ZoomImage } from "../../atoms/ZoomImage/ZoomImage";
import type { PlaceItem } from "../../../types/auth";

interface PlaceCardProps {
  place: PlaceItem;
  isFavorite: boolean;
  isEffectiveAdmin: boolean;
  onToggleFavorite: (title: string) => void;
  onZoomClick: (place: PlaceItem) => void;
  onBookClick: (place: PlaceItem) => void;
  onDetailsClick: (place: PlaceItem) => void;
  onToggleFeatured?: (id: string) => void;
  onEdit?: (place: PlaceItem) => void;
  onDelete?: (id: string, title: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isFavorite,
  isEffectiveAdmin,
  onToggleFavorite,
  onZoomClick,
  onBookClick,
  onDetailsClick,
  onToggleFeatured,
  onEdit,
  onDelete,
}) => {
  return (
    <article
      className={`group relative overflow-hidden rounded-[26px] bg-white border shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between ${
        isEffectiveAdmin ? "border-[#F4C430]/60 ring-1 ring-[#F4C430]/30" : "border-[#E2D9CC]"
      }`}
    >
      {/* Top Image Container with Interactive Zoom */}
      <div className="relative h-56 overflow-hidden">
        <ZoomImage
          src={place.image}
          alt={place.title}
          onZoomClick={() => onZoomClick(place)}
        />

        {/* Tag & Featured Badges */}
        <div className="absolute left-3.5 top-3.5 flex flex-col gap-1 items-start pointer-events-none">
          <Badge variant="glass" size="sm">
            {place.tag}
          </Badge>
          {place.featured && (
            <Badge variant="warning" size="sm" icon={<span>⭐</span>}>
              Destacado
            </Badge>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(place.title);
          }}
          className={`absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full shadow-md backdrop-blur-md transition ${
            isFavorite ? "bg-[#D81B60] text-white scale-110" : "bg-white/90 text-[#37474F] hover:bg-white"
          }`}
          aria-label={`Guardar ${place.title}`}
        >
          <Icon name="heart" size={18} filled={isFavorite} />
        </button>

        {/* Admin Superimposed Quick Controls */}
        {isEffectiveAdmin && (
          <div className="absolute bottom-2 inset-x-2 rounded-xl bg-[#0F172A]/90 backdrop-blur-md p-1.5 flex items-center justify-between gap-1 shadow-lg border border-white/20 animate-in fade-in">
            {onToggleFeatured && (
              <button
                type="button"
                onClick={() => onToggleFeatured(place.id)}
                className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 px-1.5 text-[10px] font-subtitle font-bold transition ${
                  place.featured ? "bg-[#F7931E] text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title="Alternar selección como Destacado"
              >
                <span>{place.featured ? "⭐ Destacado" : "☆ Destacar"}</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(place)}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white py-1 px-1.5 text-[10px] font-subtitle font-bold transition"
                title="Editar información del lugar"
              >
                <Icon name="edit" size={12} />
                <span>Editar</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(place.id, place.title)}
                className="h-6 w-6 rounded-lg bg-red-600 hover:bg-red-500 text-white grid place-items-center text-xs transition"
                title="Eliminar este destino"
              >
                <Icon name="trash" size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-medium text-[#6D4C41]">
              <Icon name="pin" size={14} /> {place.area}
            </span>
            <span className="flex items-center gap-1 font-subtitle font-bold text-[#37474F]">
              <span className="text-[#F4C430] text-sm">★</span> {place.rating}
            </span>
          </div>

          <h3 className="font-subtitle text-lg font-bold text-[#37474F] group-hover:text-[#D81B60] transition leading-snug">
            {place.title}
          </h3>
        </div>

        {/* Footer actions: Duration, Book/Pay CTA, Details */}
        <div className="mt-5 border-t border-[#E8E3D8] pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1 text-[#6D4C41]">
              <Icon name="clock" size={14} /> {place.time}
            </span>
            <button
              type="button"
              onClick={() => onDetailsClick(place)}
              className="font-subtitle font-bold text-[#6D4C41] hover:text-[#D81B60] transition"
            >
              Ver detalles →
            </button>
          </div>

          {/* Book / Pay Now Button */}
          <button
            type="button"
            onClick={() => onBookClick(place)}
            className="w-full rounded-xl bg-gradient-to-r from-[#D81B60] to-[#b0144c] hover:from-[#c21453] hover:to-[#96103f] text-white py-2 px-3 font-subtitle text-xs font-extrabold shadow-sm hover:shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Icon name="ticket" size={14} />
            <span>Reservar y Pagar (Bs. 85)</span>
          </button>
        </div>
      </div>
    </article>
  );
};
