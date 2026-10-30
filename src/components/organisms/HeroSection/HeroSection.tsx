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
}

const travelerOptions: SelectOption[] = [
  { value: "1 persona", label: "1 persona", badge: "Solo" },
  { value: "2 personas", label: "2 personas", badge: "Pareja" },
  { value: "Familia (3–5)", label: "Familia (3–5)", badge: "Familiar" },
  { value: "Grupo (6+)", label: "Grupo (6+)", badge: "Amigos / Tour" },
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
}) => {
  return (
    <section id="inicio" className="relative pb-16 pt-6 sm:pb-24 sm:pt-10">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-[#1E293B] px-6 py-16 sm:px-12 sm:py-24 shadow-2xl">
          {/* Background Image with Ambient Overlay */}
          <img
            src={heroImage}
            alt="Cerro Tunari y ciudad de Cochabamba"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/80 via-transparent to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl text-white">
            <span className="eyebrow-hero mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 font-subtitle text-xs font-black tracking-widest text-[#F4C430] border border-white/20">
              <span>✦</span> CORAZÓN DE BOLIVIA
            </span>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Cochabamba te espera.
            </h1>

            <p className="font-subtitle mt-4 text-base sm:text-xl font-medium text-white/90 leading-snug">
              Gastronomía inigualable, valles templados, cultura viva y el Cristo de la Concordia en un solo viaje.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#destacados"
                className="inline-flex items-center gap-2 rounded-full bg-[#D81B60] px-7 py-3.5 font-subtitle text-sm font-extrabold text-white shadow-xl shadow-[#D81B60]/40 transition hover:bg-[#b0144c] hover:scale-105 active:scale-95"
              >
                Explorar Rutas <Icon name="arrow" size={17} />
              </a>

              <button
                type="button"
                onClick={onOpenCalendar}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/30 backdrop-blur-md px-6 py-3 font-subtitle text-sm font-bold text-white transition hover:bg-white hover:text-[#37474F]"
              >
                <Icon name="calendar" size={17} /> Planificar Fechas
              </button>

              {!currentUser && (
                <button
                  type="button"
                  onClick={() => onOpenAuthModal("login")}
                  className="inline-flex items-center gap-2 rounded-full border border-[#F4C430] bg-[#1E293B]/80 backdrop-blur-md px-5 py-3 font-subtitle text-xs font-black text-[#F4C430] hover:bg-[#F4C430] hover:text-[#1E293B] transition"
                >
                  <span>🔐 Iniciar Sesión / Demo</span>
                </button>
              )}
            </div>
          </div>

          {/* INTEGRATED INTELLIGENT SEARCH BOX */}
          <div className="relative z-20 mt-12 max-w-[1080px] rounded-3xl bg-white p-3 text-[#37474F] shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-[#E2D9CC]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.2fr_1fr_auto] lg:divide-x lg:divide-[#E2D9CC]">
              {/* Field 1: SearchCombobox with live suggestions */}
              <div className="search-field">
                <span className="search-icon text-[#D81B60]">
                  <Icon name="search" size={22} />
                </span>
                <div className="w-full">
                  <small className="block text-xs font-semibold text-[#6D4C41]">
                    ¿Qué quieres experimentar?
                  </small>
                  <SearchCombobox
                    places={places}
                    value={searchQuery}
                    onChange={onSearchChange}
                    onSelectOption={onSelectSearchOption}
                    placeholder="Escribe: tunari, gastronomía, museos..."
                  />
                </div>
              </div>

              {/* Field 2: Calendar trigger */}
              <div
                className="search-field cursor-pointer group"
                onClick={onOpenCalendar}
                title="Haz clic para abrir el calendario interactivo"
              >
                <span className="search-icon text-[#F7931E] group-hover:scale-110 transition">
                  <Icon name="calendar" size={22} />
                </span>
                <div className="w-full">
                  <small className="block text-xs font-semibold text-[#6D4C41]">¿Cuándo viajas?</small>
                  <div className="flex items-center justify-between">
                    <span className="font-subtitle text-[14px] sm:text-[15px] font-bold text-[#37474F] truncate">
                      {dateRangeLabel}
                    </span>
                    <span className="ml-2 rounded-full bg-[#D81B60]/10 px-2.5 py-0.5 font-subtitle text-[10px] font-bold text-[#D81B60] shrink-0 border border-[#D81B60]/20">
                      Calendario 📅
                    </span>
                  </div>
                </div>
              </div>

              {/* Field 3: Searchable Travelers Selector */}
              <div className="search-field">
                <span className="search-icon text-[#4CAF50]">
                  <Icon name="people" size={22} />
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
                  className="w-full h-full min-h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#D81B60] px-7 font-subtitle text-sm font-extrabold text-white shadow-lg shadow-[#D81B60]/30 transition hover:bg-[#b0144c] hover:shadow-xl active:scale-95"
                >
                  <span>Buscar</span>
                  <Icon name="arrow" size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
