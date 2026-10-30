import React from "react";
import { Icon, type IconName } from "../../atoms/Icon/Icon";

interface QuickCardData {
  title: string;
  badge: string;
  desc: string;
  bg: string;
  border: string;
  hoverBg: string;
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
    badge: "Aire Puro",
    desc: "Valles templados, lagunas y la imponente cordillera.",
    bg: "bg-[#F0FDF4]",
    border: "border-[#BBF7D0]",
    hoverBg: "hover:bg-[#DCFCE7]",
    icon: "mountain",
    accent: "#16A34A",
    catKey: "naturaleza",
  },
  {
    title: "Cultura",
    badge: "Patrimonio",
    desc: "Casonas, templos coloniales y el Cristo de la Concordia.",
    bg: "bg-[#FFFBEB]",
    border: "border-[#FDE68A]",
    hoverBg: "hover:bg-[#FEF3C7]",
    icon: "compass",
    accent: "#D97706",
    catKey: "cultura",
  },
  {
    title: "Gastronomía",
    badge: "Capital Culinaria",
    desc: "Salteñas al paso, chicharrón y el inigualable silpancho.",
    bg: "bg-[#FFF1F2]",
    border: "border-[#FECDD3]",
    hoverBg: "hover:bg-[#FFE4E6]",
    icon: "utensils",
    accent: "#E11D48",
    catKey: "gastronomia",
  },
  {
    title: "Aventura",
    badge: "Adrenalina",
    desc: "Trekking en el Tunari, ciclismo de montaña y parapente.",
    bg: "bg-[#ECFEFF]",
    border: "border-[#A5F3FC]",
    hoverBg: "hover:bg-[#CFFAFE]",
    icon: "sparkle",
    accent: "#0891B2",
    catKey: "aventura",
  },
];

export const QuickCategorySection: React.FC<QuickCategorySectionProps> = ({ onSelectCategory }) => {
  return (
    <section id="explora" className="mx-auto max-w-[1240px] px-5 -mt-6 sm:-mt-10 relative z-20 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {quickCards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => {
              onSelectCategory(card.catKey);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`${card.bg} ${card.hoverBg} ${card.border} group rounded-3xl border-2 p-5 sm:p-6 text-left shadow-lg hover:shadow-2xl transition hover:-translate-y-1.5 flex flex-col justify-between min-h-[160px]`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-md transition group-hover:scale-110"
                style={{ color: card.accent }}
              >
                <Icon name={card.icon} size={24} />
              </span>
              <span className="font-subtitle text-[10px] font-extrabold uppercase tracking-wider text-[#6D4C41] bg-white/80 px-2 py-0.5 rounded-full shadow-2xs">
                {card.badge}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-subtitle text-lg sm:text-xl font-extrabold text-[#37474F] group-hover:text-[#D81B60] transition">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-[#6D4C41] leading-relaxed line-clamp-2">
                {card.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
