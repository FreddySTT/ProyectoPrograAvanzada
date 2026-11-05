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
  onOpenMap?: (place: PlaceItem) => void;
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
  onOpenMap,
}) => {
  return (
    <article
      className={`group relative overflow-hidden rounded-xl bg-white border shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between ${
        isEffectiveAdmin ? "border-amber-400/80 ring-1 ring-amber-400/30" : "border-slate-200/90"
      }`}
    >
      {/* Top Image Container with Interactive Zoom */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <ZoomImage
          src={place.image}
          alt={place.title}
          onZoomClick={() => onZoomClick(place)}
        />

        {/* Tag & Featured Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1 items-start pointer-events-none z-10">
          <Badge variant="glass" size="sm">
            {place.tag}
          </Badge>
          {place.featured && (
            <Badge variant="warning" size="sm" icon={<span>⭐</span>}>
              Destacado
            </Badge>
          )}
        </div>

        {/* Quick Zoom Lens Trigger Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onZoomClick(place);
          }}
          className="absolute left-3 bottom-3 z-20 flex items-center gap-1.5 rounded-md bg-slate-900/85 hover:bg-rose-700 text-white px-2.5 py-1 text-[11px] font-subtitle font-bold backdrop-blur-md shadow-sm border border-white/20 transition cursor-pointer"
          title="Ver foto en alta resolución con lupa"
        >
          <span>🔍</span>
          <span>Zoom</span>
        </button>

        {/* Map Shortcut Button */}
        {onOpenMap && place.coordinates && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMap(place);
            }}
            className="absolute left-20 bottom-3 z-20 flex items-center gap-1 rounded-md bg-slate-900/85 hover:bg-blue-600 text-white px-2.5 py-1 text-[11px] font-subtitle font-bold backdrop-blur-md shadow-sm border border-white/20 transition cursor-pointer"
            title="Ver ubicación y trazar ruta en el mapa"
          >
            <span>🧭</span>
            <span>Mapa</span>
          </button>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(place.title);
          }}
          className={`absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-lg shadow-sm backdrop-blur-md transition cursor-pointer border ${
            isFavorite
              ? "bg-rose-700 text-white border-rose-700 scale-105"
              : "bg-white/95 text-slate-600 hover:text-rose-600 hover:bg-white border-white/60"
          }`}
          aria-label={`Guardar ${place.title}`}
        >
          <Icon name="heart" size={16} filled={isFavorite} />
        </button>

        {/* Admin Superimposed Quick Controls */}
        {isEffectiveAdmin && (
          <div className="absolute top-12 right-2 z-20 rounded-lg bg-slate-900/90 backdrop-blur-md p-1.5 flex flex-col gap-1 shadow-md border border-slate-700">
            {onToggleFeatured && (
              <button
                type="button"
                onClick={() => onToggleFeatured(place.id)}
                className={`flex items-center justify-center gap-1 rounded-md py-1 px-2 text-[10px] font-subtitle font-bold transition cursor-pointer ${
                  place.featured ? "bg-amber-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title="Alternar selección como Destacado"
              >
                <span>{place.featured ? "⭐" : "☆"}</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(place)}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-500 text-white grid place-items-center text-xs transition cursor-pointer"
                title="Editar información del lugar"
              >
                <Icon name="edit" size={12} />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(place.id, place.title)}
                className="h-6 w-6 rounded-md bg-rose-600 hover:bg-rose-500 text-white grid place-items-center text-xs transition cursor-pointer"
                title="Eliminar este destino"
              >
                <Icon name="trash" size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <Icon name="pin" size={13} />
              <span className="truncate max-w-[130px]">{place.area}</span>
            </span>
            <span className="flex items-center gap-1 font-subtitle font-bold text-slate-800">
              <span className="text-amber-500 text-xs">★</span>
              <span>{place.rating}</span>
            </span>
          </div>

          <h3
            onClick={() => onDetailsClick(place)}
            className="font-subtitle text-base font-bold text-slate-900 group-hover:text-rose-700 transition leading-snug cursor-pointer"
            title="Haz clic para ver detalles"
          >
            {place.title}
          </h3>
        </div>

        {/* Footer actions: Duration, Book/Pay CTA, Details */}
        <div className="mt-4 border-t border-slate-100 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1 text-slate-500">
              <Icon name="clock" size={13} />
              <span>{place.time}</span>
            </span>
            <button
              type="button"
              onClick={() => onDetailsClick(place)}
              className="font-subtitle font-bold text-rose-700 hover:underline transition flex items-center gap-0.5 cursor-pointer text-xs"
            >
              <span>Detalles</span>
              <span>→</span>
            </button>
          </div>

          {/* Book / Pay Now Button */}
          <button
            type="button"
            onClick={() => onBookClick(place)}
            className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 font-subtitle text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>💳</span>
            <span>Reservar experiencia</span>
          </button>
        </div>
      </div>
    </article>
  );
};
