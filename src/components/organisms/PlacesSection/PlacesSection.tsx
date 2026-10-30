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
}) => {
  return (
    <section id="destacados" className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
      {/* Section Header & Search + Filter Bar */}
      <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">—— DESTINOS DESTACADOS</p>
            {isEffectiveAdmin && (
              <span className="rounded-full bg-[#1E293B] px-2.5 py-0.5 font-subtitle text-[10px] font-black uppercase text-[#F4C430] border border-[#F4C430]/40">
                👑 Controles Admin Activos
              </span>
            )}
          </div>
          <h2 className="section-title">Lugares que te enamoran</h2>
          <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-[#6D4C41]">
            Pasa el cursor sobre cualquier foto para <strong>hacer zoom interactivo</strong> hacia la imagen o haz clic para verla en pantalla completa.
          </p>

          {/* Active Search Filter Badge */}
          {searchQuery && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] px-3.5 py-1.5 text-xs text-[#D81B60] shadow-2xs animate-in fade-in">
              <span className="font-bold">Filtro activo:</span>
              <span className="font-extrabold font-subtitle">"{searchQuery}"</span>
              <span className="text-[11px] text-[#6D4C41]">({filteredPlaces.length} encontrados)</span>
              <button
                type="button"
                onClick={onClearSearch}
                className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-[#D81B60] text-white text-[11px] hover:bg-[#b0144c] transition"
                title="Quitar filtro de búsqueda"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Quick Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quick Search Input inside Places Section */}
          {onSearchChange && (
            <div className="relative flex-1 sm:w-64">
              <div className="flex items-center gap-2 rounded-full border border-[#E2D9CC] bg-white px-3.5 py-2 shadow-xs focus-within:border-[#D81B60] focus-within:ring-2 focus-within:ring-[#D81B60]/20 transition">
                <span className="text-[#D81B60]">
                  <Icon name="search" size={16} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filtrar por nombre, zona..."
                  className="w-full font-subtitle text-xs font-bold text-[#37474F] placeholder:text-[#6D4C41]/60 focus:outline-hidden bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="text-[#6D4C41] hover:text-[#D81B60] text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onFilterChange("todos")}
              className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                selectedFilter === "todos"
                  ? "bg-[#D81B60] text-white shadow-md shadow-[#D81B60]/25"
                  : "bg-white text-[#6D4C41] border border-[#E2D9CC] hover:border-[#D81B60]"
              }`}
            >
              Todos ({places.length})
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("destacados")}
              className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs flex items-center gap-1 ${
                selectedFilter === "destacados"
                  ? "bg-[#F7931E] text-white shadow-md"
                  : "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] hover:bg-[#FDE68A]"
              }`}
            >
              <span>⭐ Destacados</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("naturaleza")}
              className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                selectedFilter === "naturaleza"
                  ? "bg-[#4CAF50] text-white"
                  : "bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"
              }`}
            >
              Naturaleza
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("cultura")}
              className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                selectedFilter === "cultura"
                  ? "bg-[#F7931E] text-white"
                  : "bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
              }`}
            >
              Cultura
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("gastronomia")}
              className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                selectedFilter === "gastronomia"
                  ? "bg-[#D81B60] text-white"
                  : "bg-[#FFE4E6] text-[#BE123C] hover:bg-[#FECDD3]"
              }`}
            >
              Gastronomía
            </button>

            <button
              type="button"
              onClick={() => onFilterChange("aventura")}
              className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                selectedFilter === "aventura"
                  ? "bg-[#0097A7] text-white"
                  : "bg-[#CFFAFE] text-[#0E7490] hover:bg-[#A5F3FC]"
              }`}
            >
              Aventura
            </button>

            {isEffectiveAdmin && (
              <button
                type="button"
                onClick={onOpenNewPlaceModal}
                className="rounded-full bg-[#1E293B] text-[#F4C430] hover:bg-[#334155] border border-[#F4C430]/40 px-4 py-1.5 font-subtitle text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
              >
                <Icon name="plus" size={15} /> Aumentar Lugar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Places Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Admin Card for Fast Creation */}
        {isEffectiveAdmin && (
          <button
            type="button"
            onClick={onOpenNewPlaceModal}
            className="group relative min-h-[380px] rounded-[26px] border-2 border-dashed border-[#D81B60]/60 bg-gradient-to-b from-[#FFF1F2]/60 to-white p-6 text-center shadow-xs hover:border-[#D81B60] hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center gap-4"
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#D81B60] text-white shadow-lg shadow-[#D81B60]/30 group-hover:scale-110 transition">
              <Icon name="plus" size={30} />
            </div>
            <div>
              <h3 className="font-subtitle text-xl font-extrabold text-[#37474F] group-hover:text-[#D81B60] transition">
                Aumentar Nueva Ruta
              </h3>
              <p className="mt-1 text-xs text-[#6D4C41] max-w-[200px] mx-auto leading-relaxed">
                Añade un nuevo atractivo o experiencia al portal turístico.
              </p>
            </div>
            <span className="rounded-full bg-[#D81B60] px-4 py-1.5 font-subtitle text-xs font-bold text-white shadow-xs">
              + Crear Destino
            </span>
          </button>
        )}

        {filteredPlaces.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-4 rounded-3xl bg-white border border-[#E2D9CC] p-12 text-center shadow-sm">
            <span className="text-4xl">🔍</span>
            <h3 className="font-subtitle text-xl font-bold text-[#37474F] mt-3">
              No encontramos destinos que coincidan con "{searchQuery}"
            </h3>
            <p className="text-sm text-[#6D4C41] mt-1 max-w-md mx-auto">
              Intenta con palabras como "Tunari", "Salteñas", "Cultura", "San Pedro", o limpia la búsqueda.
            </p>
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-5 rounded-full bg-[#D81B60] text-white font-subtitle text-xs font-bold px-6 py-2.5 shadow-md hover:bg-[#b0144c] transition"
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
            />
          ))
        )}
      </div>
    </section>
  );
};
