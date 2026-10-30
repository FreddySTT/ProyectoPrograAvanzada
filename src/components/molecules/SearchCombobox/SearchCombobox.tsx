import React, { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "../../atoms/Icon/Icon";
import type { PlaceItem } from "../../../types/auth";

export interface SearchOption {
  id: string;
  type: "place" | "category" | "area" | "tag";
  title: string;
  subtitle: string;
  category?: string;
  image?: string;
  tag?: string;
  rating?: string;
}

interface SearchComboboxProps {
  places: PlaceItem[];
  value: string;
  onChange: (query: string) => void;
  onSelectOption: (option: SearchOption) => void;
  placeholder?: string;
}

// Normalizador insensible a acentos, diacríticos y mayúsculas
const cleanStr = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const SearchCombobox: React.FC<SearchComboboxProps> = ({
  places,
  value,
  onChange,
  onSelectOption,
  placeholder = "Escribe: tunari, silpancho, cristo, canchas...",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generar índice completo de opciones
  const indexedOptions = useMemo<SearchOption[]>(() => {
    const list: SearchOption[] = [];

    // 1. Lugares turísticos
    places.forEach((p) => {
      list.push({
        id: `place-${p.id}`,
        type: "place",
        title: p.title,
        subtitle: `${p.area} · ${p.category?.toUpperCase() || ""}`,
        category: p.category,
        image: p.image,
        tag: p.tag,
        rating: p.rating,
      });
    });

    // 2. Categorías temáticas principales
    const categories = [
      { id: "cat-gastronomia", title: "Gastronomía Cochabambina", subtitle: "Silpancho, salteñas, chicharrón y mercados", category: "gastronomia" },
      { id: "cat-cultura", title: "Cultura & Patrimonio", subtitle: "Cristo de la Concordia, Palacio Portales y templos", category: "cultura" },
      { id: "cat-naturaleza", title: "Naturaleza & Cordillera", subtitle: "Parque Tunari, lagunas y valles fértiles", category: "naturaleza" },
      { id: "cat-aventura", title: "Aventura & Senderismo", subtitle: "Trekking en altura, descenso en bici y miradores", category: "aventura" },
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

    // 3. Áreas / Zonas
    const areas = Array.from(new Set(places.map((p) => p.area).filter(Boolean)));
    areas.forEach((area) => {
      list.push({
        id: `area-${area}`,
        type: "area",
        title: area,
        subtitle: "Zona y circuito turístico",
      });
    });

    return list;
  }, [places]);

  // Filtrado reactivo en tiempo real al tipear cualquier letra
  const filteredSuggestions = useMemo(() => {
    const q = cleanStr(value);
    if (!q) {
      // Sugerencias inmediatas al hacer foco sin escribir
      return indexedOptions.slice(0, 6);
    }

    // Sinónimos comunes para mejorar la búsqueda
    const synonyms: Record<string, string[]> = {
      comer: ["gastronomia", "silpancho", "pique", "saltena", "cancha", "platos"],
      comida: ["gastronomia", "silpancho", "pique", "saltena", "cancha"],
      almuerzo: ["gastronomia", "silpancho", "chicharron"],
      ver: ["cultura", "cristo", "portales", "tunari", "mirador"],
      visitar: ["cultura", "cristo", "portales", "tunari"],
      montana: ["tunari", "naturaleza", "aventura", "cordillera"],
      cerro: ["san pedro", "cristo", "tunari"],
    };

    // Términos expandidos si aplica
    let expandedTerms = [q];
    Object.entries(synonyms).forEach(([keyword, related]) => {
      if (q.includes(keyword) || keyword.includes(q)) {
        expandedTerms = [...expandedTerms, ...related];
      }
    });

    return indexedOptions
      .filter((opt) => {
        const titleNorm = cleanStr(opt.title);
        const subNorm = cleanStr(opt.subtitle);
        const catNorm = cleanStr(opt.category || "");
        const tagNorm = cleanStr(opt.tag || "");

        return expandedTerms.some(
          (t) =>
            titleNorm.includes(t) ||
            subNorm.includes(t) ||
            catNorm.includes(t) ||
            tagNorm.includes(t)
        );
      })
      .slice(0, 8);
  }, [value, indexedOptions]);

  // Cierre al hacer click fuera
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
          onClick={() => setIsOpen(true)}
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

      {/* Autocomplete Dropdown Popup - Floating & Never clipped */}
      {isOpen && (
        <div className="absolute left-0 mt-3 z-[9999] w-[calc(100vw-2rem)] sm:w-[480px] lg:w-[540px] max-w-[92vw] rounded-2xl bg-white p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border-2 border-[#E2D9CC] overflow-hidden max-h-[390px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-subtitle font-black text-[#6D4C41] uppercase tracking-wider flex items-center justify-between border-b border-[#E2D9CC]/60 mb-1">
            <span>
              {value
                ? `Resultados encontrados (${filteredSuggestions.length})`
                : "Destinos y sabores sugeridos"}
            </span>
            <span className="text-[10px] text-[#D81B60] font-bold">Usa ↑↓ o clic</span>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="p-5 text-center text-xs text-[#6D4C41]">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-[#FFF1F2] text-[#D81B60]">
                <Icon name="search" size={20} />
              </div>
              <p className="font-bold text-sm text-[#37474F]">No encontramos "{value}"</p>
              <p className="mt-1 text-[11px] text-gray-500">
                Prueba con: <span className="font-semibold text-[#D81B60]">tunari</span>,{" "}
                <span className="font-semibold text-[#D81B60]">cristo</span>,{" "}
                <span className="font-semibold text-[#D81B60]">silpancho</span>,{" "}
                <span className="font-semibold text-[#D81B60]">cancha</span> o{" "}
                <span className="font-semibold text-[#D81B60]">portales</span>.
              </p>
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
                    isSelected ? "bg-[#FFF1F2] text-[#D81B60] scale-[1.01]" : "hover:bg-[#FAF7F2] text-[#37474F]"
                  }`}
                >
                  {/* Thumbnail Image / Icon */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-11 w-11 rounded-xl object-cover shrink-0 shadow-sm ring-2 ring-[#E2D9CC]"
                    />
                  ) : (
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FAF7F2] text-[#D81B60] border border-[#E2D9CC]">
                      {item.type === "category" ? (
                        <Icon name="compass" size={20} />
                      ) : item.type === "area" ? (
                        <Icon name="pin" size={20} />
                      ) : (
                        <Icon name="search" size={20} />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-subtitle text-xs sm:text-sm font-black truncate">
                        {item.title}
                      </span>
                      {item.rating && (
                        <span className="flex items-center text-[10px] font-bold text-[#F7931E]">
                          ★ {item.rating}
                        </span>
                      )}
                      {item.tag && (
                        <span className="rounded-full bg-[#D81B60]/10 px-2 py-0.5 text-[9px] font-bold text-[#D81B60] shrink-0 border border-[#D81B60]/20">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6D4C41] truncate mt-0.5 font-medium">
                      {item.subtitle}
                    </p>
                  </div>

                  <span className="text-xs text-[#D81B60] shrink-0 font-bold bg-[#FAF7F2] px-2 py-1 rounded-lg">
                    Ver →
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
