import React from "react";
import { Icon } from "../../atoms/Icon/Icon";
import { SearchCombobox, type SearchOption } from "../../molecules/SearchCombobox/SearchCombobox";
import { SearchableSelect, type SelectOption } from "../../molecules/SearchableSelect/SearchableSelect";
import heroImage from "../../../assets/cochabamba-hero.jpg";
import type { PlaceItem, User } from "../../../types/auth";

interface HeroSectionProps {
  places: PlaceItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectSearchOption: (option: SearchOption) => void;
  onSearchSubmit: () => void;
  dateRangeLabel: string;
  onOpenCalendar: () => void;
  travelers: string;
  onTravelersChange: (val: string) => void;
  currentUser: User | null;
  onOpenAuthModal: (tab: "login" | "register") => void;
  onOpenMap?: () => void;
}

const travelerOptions: SelectOption[] = [
  { value: "1 persona", label: "1 persona", badge: "Solo" },
  { value: "2 personas", label: "2 personas", badge: "Pareja" },
  { value: "Familia (3–5)", label: "Familia (3–5)", badge: "Familiar" },
  { value: "Grupo (6+)", label: "Grupo (6+)", badge: "Tour" },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  places,
  searchQuery,
  onSearchChange,
  onSelectSearchOption,
  onSearchSubmit,
  dateRangeLabel,
  onOpenCalendar,
  travelers,
  onTravelersChange,
  currentUser,
  onOpenAuthModal,
  onOpenMap,
}) => {
  return (
    <section id="inicio" className="relative pb-14 pt-4 sm:pb-20 sm:pt-6">
      <div className="mx-auto max-w-[1240px] px-4 lg:px-8">
        {/* Outer Card with modern radius */}
        <div className="relative rounded-2xl bg-slate-950 px-6 py-14 sm:px-12 sm:py-20 shadow-xl overflow-visible">
          {/* Background Layer with Overflow Hidden */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <img
              src={heroImage}
              alt="Cerro Tunari y ciudad de Cochabamba"
              className="h-full w-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/10 backdrop-blur-md px-3 py-1 font-subtitle text-xs font-bold tracking-widest text-amber-300 border border-white/15">
              <span>❖</span>
              <span>CORAZÓN DE BOLIVIA</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-white">
              Cochabamba te espera.
            </h1>

            <p className="font-subtitle mt-4 text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
              Gastronomía inigualable, valles templados, cultura viva y el Cristo de la Concordia en un solo viaje.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#destacados"
                className="inline-flex items-center gap-2 rounded-lg bg-rose-700 hover:bg-rose-800 px-6 py-3 font-subtitle text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-900/30 transition hover:scale-102 active:scale-98"
              >
                <span>Explorar Rutas</span>
                <Icon name="arrow" size={16} />
              </a>

              {onOpenMap && (
                <button
                  type="button"
                  onClick={onOpenMap}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-400/40 bg-white/10 hover:bg-white hover:text-slate-900 backdrop-blur-md px-5 py-3 font-subtitle text-xs sm:text-sm font-bold text-white transition shadow-sm cursor-pointer"
                >
                  <Icon name="map" size={17} />
                  <span>Ver Mapa Interactivo</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenCalendar}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/30 backdrop-blur-md px-5 py-3 font-subtitle text-xs sm:text-sm font-bold text-slate-200 hover:bg-white hover:text-slate-900 transition"
              >
                <Icon name="calendar" size={16} />
                <span>Planificar Fechas</span>
              </button>

              {!currentUser && (
                <button
                  type="button"
                  onClick={() => onOpenAuthModal("login")}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 px-4 py-3 font-subtitle text-xs font-bold text-amber-300 transition"
                >
                  <span>Acceso / Demo</span>
                </button>
              )}
            </div>
          </div>

          {/* INTEGRATED INTELLIGENT SEARCH BOX (Clean, modern architectural look) */}
          <div className="relative z-30 mt-10 max-w-[1080px] rounded-xl bg-white p-2.5 text-slate-800 shadow-xl border border-slate-200/90">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.2fr_1fr_auto] lg:divide-x lg:divide-slate-200">
              {/* Field 1: SearchCombobox with live suggestions */}
              <div className="search-field">
                <span className="search-icon text-rose-700">
                  <Icon name="search" size={20} />
                </span>
                <div className="w-full">
                  <small className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ¿Qué quieres experimentar?
                  </small>
                  <SearchCombobox
                    places={places}
                    value={searchQuery}
                    onChange={onSearchChange}
                    onSelectOption={onSelectSearchOption}
                    placeholder="Escribe: Tunari, Silpancho, Cristo..."
                  />
                </div>
              </div>

              {/* Field 2: Calendar trigger */}
              <div
                className="search-field cursor-pointer group"
                onClick={onOpenCalendar}
                title="Haz clic para abrir el calendario de fechas"
              >
                <span className="search-icon text-amber-600 group-hover:scale-105 transition">
                  <Icon name="calendar" size={20} />
                </span>
                <div className="w-full">
                  <small className="block text-xs font-bold text-slate-500 uppercase tracking-wider">¿Cuándo viajas?</small>
                  <div className="flex items-center justify-between">
                    <span className="font-subtitle text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {dateRangeLabel}
                    </span>
                    <span className="ml-2 rounded-md bg-rose-50 px-2 py-0.5 font-subtitle text-[10px] font-bold text-rose-700 shrink-0 border border-rose-200/60">
                      Fechas
                    </span>
                  </div>
                </div>
              </div>

              {/* Field 3: Searchable Travelers Selector */}
              <div className="search-field">
                <span className="search-icon text-emerald-600">
                  <Icon name="people" size={20} />
                </span>
                <div className="w-full">
                  <SearchableSelect
                    label="Viajeros"
                    options={travelerOptions}
                    value={travelers}
                    onChange={onTravelersChange}
                    placeholder="Cantidad de personas"
                  />
                </div>
              </div>

              {/* Field 4: Search Button */}
              <div className="flex items-center p-1">
                <button
                  type="button"
                  onClick={onSearchSubmit}
                  className="w-full h-full min-h-[48px] flex items-center justify-center gap-2 rounded-lg bg-rose-700 hover:bg-rose-800 px-6 font-subtitle text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-900/20 transition active:scale-98"
                >
                  <span>Buscar</span>
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
