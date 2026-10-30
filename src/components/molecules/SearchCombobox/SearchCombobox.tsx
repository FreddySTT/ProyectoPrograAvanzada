import React, { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "../../atoms/Icon/Icon";
import { Badge } from "../../atoms/Badge/Badge";
import type { PlaceItem } from "../../../types/auth";

export interface SearchOption {
  id: string;
  type: "place" | "category" | "area" | "tag";
  title: string;
  subtitle: string;
  category?: string;
  image?: string;
  tag?: string;
}

interface SearchComboboxProps {
  places: PlaceItem[];
  value: string;
  onChange: (query: string) => void;
  onSelectOption: (option: SearchOption) => void;
  placeholder?: string;
}

export const SearchCombobox: React.FC<SearchComboboxProps> = ({
  places,
  value,
  onChange,
  onSelectOption,
  placeholder = "Gastronomía, trekking, museos, San Pedro...",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generar opciones indexadas a partir de los datos disponibles
  const indexedOptions = useMemo<SearchOption[]>(() => {
    const list: SearchOption[] = [];

    // Categorías predefinidas
    const categories = [
      { id: "cat-gastronomia", title: "Gastronomía", subtitle: "Sabores, salteñas y chicharrón de la Llajta", category: "gastronomia" },
      { id: "cat-cultura", title: "Cultura & Historia", subtitle: "Museos, palacios y monumentos icónicos", category: "cultura" },
      { id: "cat-naturaleza", title: "Naturaleza & Valles", subtitle: "Lagunas, cordilleras y aire puro", category: "naturaleza" },
      { id: "cat-aventura", title: "Aventura & Trekking", subtitle: "Ciclismo de montaña, senderos y miradores", category: "aventura" },
    ];
    categories.forEach((c) => {
      list.push({
        id: c.id,
        type: "category",
        title: c.title,
        subtitle: c.subtitle,
        category: c.category,
      });
    });

    // Lugares
    places.forEach((p) => {
      list.push({
        id: `place-${p.id}`,
        type: "place",
        title: p.title,
        subtitle: `${p.area} · ${p.category}`,
        category: p.category,
        image: p.image,
        tag: p.tag,
      });
    });

    // Áreas únicas
    const areas = Array.from(new Set(places.map((p) => p.area).filter(Boolean)));
    areas.forEach((area) => {
      list.push({
        id: `area-${area}`,
        type: "area",
        title: area,
        subtitle: "Zona turística destacada",
      });
    });

    return list;
  }, [places]);

  // Filtrar opciones dinámicamente según lo que escribe el usuario
  const filteredSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) {
      // Si no ha escrito nada, sugerencias destacadas
      return indexedOptions.slice(0, 6);
    }

    return indexedOptions
      .filter((opt) => {
        return (
          opt.title.toLowerCase().includes(query) ||
          opt.subtitle.toLowerCase().includes(query) ||
          (opt.category && opt.category.toLowerCase().includes(query)) ||
          (opt.tag && opt.tag.toLowerCase().includes(query))
        );
      })
      .slice(0, 8);
  }, [value, indexedOptions]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        e.preventDefault();
        selectOption(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectOption = (option: SearchOption) => {
    onChange(option.title);
    onSelectOption(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const clearInput = () => {
    onChange("");
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Buscar experiencia turística"
          autoComplete="off"
          className="w-full font-subtitle text-sm sm:text-base font-bold text-[#37474F] placeholder:text-[#6D4C41]/60 focus:outline-hidden bg-transparent"
        />

        {value && (
          <button
            type="button"
            onClick={clearInput}
            className="grid h-6 w-6 place-items-center rounded-full text-[#6D4C41] hover:bg-gray-100 transition shrink-0"
            title="Limpiar búsqueda"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-3 z-50 rounded-2xl bg-white p-2 shadow-2xl border border-[#E2D9CC] overflow-hidden max-h-[380px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-subtitle font-bold text-[#6D4C41] uppercase tracking-wider flex items-center justify-between border-b border-[#E2D9CC]/50 mb-1">
            <span>{value ? `Resultados sugeridos (${filteredSuggestions.length})` : "Sugerencias populares"}</span>
            <span className="text-[9px] text-[#D81B60]">Usa ↑↓ para navegar</span>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#6D4C41]">
              <p className="font-bold">No encontramos coincidencias para "{value}"</p>
              <p className="mt-1 text-[11px] text-gray-500">Prueba buscando por "Tunari", "Gastronomía", "Cala Cala" o "Cultura".</p>
            </div>
          ) : (
            filteredSuggestions.map((item, idx) => {
              const isSelected = idx === highlightedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectOption(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                    isSelected ? "bg-[#FFF1F2] text-[#D81B60]" : "hover:bg-[#FAF7F2] text-[#37474F]"
                  }`}
                >
                  {/* Thumbnail / Icon Badge */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-10 w-10 rounded-lg object-cover shrink-0 shadow-xs ring-1 ring-[#E2D9CC]"
                    />
                  ) : (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#FAF7F2] text-[#D81B60] border border-[#E2D9CC]">
                      {item.type === "category" ? (
                        <Icon name="compass" size={18} />
                      ) : item.type === "area" ? (
                        <Icon name="pin" size={18} />
                      ) : (
                        <Icon name="search" size={18} />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-subtitle text-xs sm:text-sm font-extrabold truncate">
                        {item.title}
                      </span>
                      {item.tag && (
                        <span className="rounded-full bg-[#D81B60]/10 px-2 py-0.5 text-[9px] font-bold text-[#D81B60] shrink-0">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6D4C41] truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <span className="text-xs text-[#D81B60] shrink-0 font-bold">
                    →
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
