import React from "react";
import { Icon } from "../../atoms/Icon/Icon";
import { PlaceCard } from "../../molecules/PlaceCard/PlaceCard";
import type { PlaceItem } from "../../../types/auth";

interface PlacesSectionProps {
  places: PlaceItem[];
  filteredPlaces: PlaceItem[];
  favorites: string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange?: (q: string) => void;
  onClearSearch: () => void;
  isEffectiveAdmin: boolean;
  onToggleFavorite: (title: string) => void;
  onZoomClick: (place: PlaceItem) => void;
  onBookClick: (place: PlaceItem) => void;
  onDetailsClick: (place: PlaceItem) => void;
  onOpenNewPlaceModal: () => void;
  onToggleFeatured?: (id: string) => void;
  onEditPlace?: (place: PlaceItem) => void;
  onDeletePlace?: (id: string, title: string) => void;
  onOpenMap?: (place: PlaceItem) => void;
}

export const PlacesSection: React.FC<PlacesSectionProps> = ({
  places,
  filteredPlaces,
  favorites,
  selectedFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onClearSearch,
  isEffectiveAdmin,
  onToggleFavorite,
  onZoomClick,
  onBookClick,
  onDetailsClick,
  onOpenNewPlaceModal,
  onToggleFeatured,
  onEditPlace,
  onDeletePlace,
  onOpenMap,
}) => {
  return (
    <section id="destacados" className="mx-auto max-w-[1240px] px-4 py-14 lg:px-8">
      {/* Section Header & Search + Filter Bar */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">—— DESTINOS DESTACADOS</p>
            {isEffectiveAdmin && (
              <span className="rounded-md bg-slate-900 px-2 py-0.5 font-subtitle text-[10px] font-extrabold uppercase text-amber-400 border border-slate-700">
                👑 Admin Activo
              </span>
            )}
          </div>
          <h2 className="section-title">Lugares que te enamoran</h2>
          <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-500">
            Explora los destinos emblemáticos de la Llajta. Haz clic en <strong>Zoom</strong> para ver fotos o en <strong>Mapa</strong> para calcular la ruta en tiempo real.
          </p>

          {/* Active Search Filter Badge */}
          {searchQuery && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200/80 px-3 py-1.5 text-xs text-rose-800 shadow-2xs">
              <span className="font-semibold">Búsqueda:</span>
              <span className="font-bold font-subtitle">"{searchQuery}"</span>
              <span className="text-[11px] text-slate-500">({filteredPlaces.length} encontrados)</span>
              <button
                type="button"
                onClick={onClearSearch}
                className="ml-1 grid h-4 w-4 place-items-center rounded-md bg-rose-700 text-white text-[10px] hover:bg-rose-800 transition cursor-pointer"
                title="Quitar filtro de búsqueda"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Quick Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Quick Search Input */}
          {onSearchChange && (
            <div className="relative flex-1 sm:w-60">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-2xs focus-within:border-slate-400 transition">
                <span className="text-slate-400">
                  <Icon name="search" size={15} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filtrar destinos..."
                  className="w-full font-subtitle text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Pills with modern sleek architectural radii */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "todos", label: `Todos (${places.length})` },
              { id: "destacados", label: "⭐ Destacados" },
              { id: "naturaleza", label: "Naturaleza" },
              { id: "cultura", label: "Cultura" },
              { id: "gastronomia", label: "Gastronomía" },
              { id: "aventura", label: "Aventura" },
            ].map((f) => {
              const isActive = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilterChange(f.id)}
                  className={`rounded-lg px-3 py-1.5 font-subtitle text-xs font-bold transition shadow-2xs cursor-pointer border ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}

            {isEffectiveAdmin && (
              <button
                type="button"
                onClick={onOpenNewPlaceModal}
                className="rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 font-subtitle text-xs font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Icon name="plus" size={13} />
                <span>Nuevo Lugar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Places Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Admin Card for Fast Creation */}
        {isEffectiveAdmin && (
          <button
            type="button"
            onClick={onOpenNewPlaceModal}
            className="group relative min-h-[360px] rounded-xl border border-dashed border-rose-300 bg-rose-50/30 p-6 text-center shadow-xs hover:border-rose-500 hover:shadow-md transition duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer"
          >
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-rose-700 text-white shadow-sm group-hover:scale-105 transition">
              <Icon name="plus" size={26} />
            </div>
            <div>
              <h3 className="font-subtitle text-lg font-bold text-slate-900 group-hover:text-rose-700 transition">
                Añadir Nuevo Destino
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                Registra un nuevo atractivo o ruta gastronómica en el sistema.
              </p>
            </div>
            <span className="rounded-lg bg-rose-700 px-3.5 py-1.5 font-subtitle text-xs font-bold text-white shadow-xs">
              + Crear Destino
            </span>
          </button>
        )}

        {filteredPlaces.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-4 rounded-xl bg-white border border-slate-200 p-10 text-center shadow-xs">
            <span className="text-3xl">🔍</span>
            <h3 className="font-subtitle text-lg font-bold text-slate-900 mt-2">
              No encontramos destinos que coincidan con "{searchQuery}"
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Intenta con palabras como "Tunari", "Silpancho", "Cultura", "San Pedro", o limpia el filtro.
            </p>
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-4 rounded-lg bg-slate-900 text-white font-subtitle text-xs font-bold px-5 py-2 shadow-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Ver todos los destinos ({places.length})
            </button>
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              isFavorite={favorites.includes(place.title)}
              isEffectiveAdmin={isEffectiveAdmin}
              onToggleFavorite={onToggleFavorite}
              onZoomClick={onZoomClick}
              onBookClick={onBookClick}
              onDetailsClick={onDetailsClick}
              onToggleFeatured={onToggleFeatured}
              onEdit={onEditPlace}
              onDelete={onDeletePlace}
              onOpenMap={onOpenMap}
            />
          ))
        )}
      </div>
    </section>
  );
};
