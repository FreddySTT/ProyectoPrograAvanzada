import React, { useState, useRef, useEffect } from "react";
import { Icon } from "../../atoms/Icon/Icon";

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar opción...",
  label,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.badge && opt.badge.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {label && <small className="block text-xs font-semibold text-[#6D4C41] mb-1">{label}</small>}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-subtitle font-bold text-[14px] text-[#37474F] bg-transparent focus:outline-hidden py-0.5"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`transition-transform text-[#6D4C41] ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {/* Searchable Options Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white p-2 shadow-2xl border border-[#E2D9CC] min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Live Search Input */}
          <div className="relative mb-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] px-3 py-1.5 text-xs font-medium text-[#37474F] placeholder:text-gray-400 focus:outline-hidden focus:border-[#D81B60]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-xs text-[#6D4C41]">Sin coincidencias</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-subtitle font-bold transition ${
                    opt.value === value
                      ? "bg-[#D81B60] text-white"
                      : "hover:bg-[#FAF7F2] text-[#37474F]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full ${
                        opt.value === value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
