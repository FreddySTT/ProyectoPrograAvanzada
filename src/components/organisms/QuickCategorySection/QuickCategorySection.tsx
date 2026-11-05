import React from "react";
import { Icon, type IconName } from "../../atoms/Icon/Icon";

interface QuickCardData {
  title: string;
  badge: string;
  desc: string;
  icon: IconName;
  accent: string;
  catKey: "naturaleza" | "cultura" | "gastronomia" | "aventura";
}

interface QuickCategorySectionProps {
  onSelectCategory: (category: "naturaleza" | "cultura" | "gastronomia" | "aventura") => void;
}

const quickCards: QuickCardData[] = [
  {
    title: "Naturaleza",
    badge: "Valles & Altura",
    desc: "Lagunas andinas, aire puro y la imponente cordillera del Tunari.",
    icon: "mountain",
    accent: "#059669",
    catKey: "naturaleza",
  },
  {
    title: "Cultura",
    badge: "Patrimonio Vivo",
    desc: "Casonas republicanas, templos coloniales y el Cristo de la Concordia.",
    icon: "compass",
    accent: "#7C3AED",
    catKey: "cultura",
  },
  {
    title: "Gastronomía",
    badge: "Capital Culinaria",
    desc: "Salteñas de media mañana, chicharrón de la llajta y silpancho tradicional.",
    icon: "utensils",
    accent: "#BE123C",
    catKey: "gastronomia",
  },
  {
    title: "Aventura",
    badge: "Rutas Activas",
    desc: "Trekking de altura, parapente y circuitos ciclistas por el valle.",
    icon: "sparkle",
    accent: "#0284C7",
    catKey: "aventura",
  },
];

export const QuickCategorySection: React.FC<QuickCategorySectionProps> = ({ onSelectCategory }) => {
  return (
    <section id="explora" className="mx-auto max-w-[1240px] px-4 -mt-6 sm:-mt-8 relative z-20 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {quickCards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => {
              onSelectCategory(card.catKey);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group relative rounded-xl border border-slate-200/90 bg-white p-5 text-left shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[155px] cursor-pointer overflow-hidden"
          >
            {/* Top accent hairline */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: card.accent }}
            />

            <div className="flex items-center justify-between w-full">
              <span
                className="grid h-10 w-10 place-items-center rounded-lg bg-slate-50 border border-slate-100 shadow-2xs transition group-hover:scale-105"
                style={{ color: card.accent }}
              >
                <Icon name={card.icon} size={22} />
              </span>
              <span className="font-subtitle text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60">
                {card.badge}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-subtitle text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-700 transition">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                {card.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
