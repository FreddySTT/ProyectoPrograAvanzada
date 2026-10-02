import { useState } from "react";
import { CalendarPicker, type DateRange } from "./components/CalendarPicker";
import heroImage from "./assets/cochabamba-hero.jpg";
import adventureBikeImage from "./assets/aventura-bici.jpg";
import adventureHikeImage from "./assets/aventura-caminata.jpg";
import cultureStreetImage from "./assets/cultura-calle.jpg";
import cultureDanceImage from "./assets/cultura-danza.jpg";
import foodDishesImage from "./assets/comida-platos.jpg";
import foodTraditionalImage from "./assets/comida-tradicional.jpg";
import foodImage from "./assets/gastronomia.jpg";
import heritageImage from "./assets/patrimonio.jpg";
import natureValleyImage from "./assets/naturaleza-valle.jpg";
import natureGreenImage from "./assets/naturaleza-verde.jpg";
import traditionImage from "./assets/tradicion.jpg";
import tunariImage from "./assets/tunari.jpg";

type IconName =
  | "arrow"
  | "calendar"
  | "chevron"
  | "clock"
  | "compass"
  | "heart"
  | "map"
  | "menu"
  | "people"
  | "pin"
  | "route"
  | "search"
  | "sparkle"
  | "star"
  | "user"
  | "home"
  | "utensils"
  | "mountain"
  | "instagram"
  | "facebook"
  | "youtube";

function Icon({ name, size = 20, filled = false }: { name: IconName; size?: number; filled?: boolean }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    route: <><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M7 19h3a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3h1" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sparkle: <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />,
    star: <path d="m12 2.7 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.3l6.2-.9L12 2.7Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    utensils: <><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" /><path d="M15 2v20" /><path d="M6 2v20" /><path d="M6 6h4" /></>,
    mountain: <><path d="m8 3 4 8 5-5 5 11H2L8 3z" /></>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>,
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    youtube: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></>,
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function AndeanDiamond({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block" aria-hidden="true">
      {/* Top petal - Fucsia Andino */}
      <polygon points="12,2 16,7 12,12 8,7" fill="#D81B60" />
      {/* Bottom petal - Amarillo Sol */}
      <polygon points="12,12 16,17 12,22 8,17" fill="#F4C430" />
      {/* Left petal - Verde Valle */}
      <polygon points="2,12 7,8 12,12 7,16" fill="#4CAF50" />
      {/* Right petal - Naranja Ayni */}
      <polygon points="12,12 17,8 22,12 17,16" fill="#F7931E" />
      {/* Center dot - Morado de la Cultura */}
      <circle cx="12" cy="12" r="2.2" fill="#7B1FA2" />
    </svg>
  );
}

function MountainLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 24L11 9L17 19L22 12L29 24H3Z" />
      <path d="M11 9L14 14" />
      <path d="M22 12L24 16" />
      <circle cx="24" cy="7" r="2.5" fill="#F4C430" stroke="none" />
    </svg>
  );
}

const places = [
  { title: "Cristo de la Concordia", area: "Cerro San Pedro", tag: "Imperdible", category: "cultura", image: heroImage, rating: "4.8", time: "2–3 h" },
  { title: "Palacio Portales", area: "Queru Queru", tag: "Cultura", category: "cultura", image: heritageImage, rating: "4.7", time: "1–2 h" },
  { title: "Parque Nacional Tunari", area: "Cordillera", tag: "Naturaleza", category: "naturaleza", image: tunariImage, rating: "4.9", time: "Día completo" },
  { title: "Mercado La Cancha & Sabores", area: "La Cancha", tag: "Gastronomía", category: "gastronomia", image: foodImage, rating: "4.9", time: "2 h" },
  { title: "Valle de las Ánimas", area: "Tiquipaya", tag: "Naturaleza", category: "naturaleza", image: natureValleyImage, rating: "4.8", time: "4–5 h" },
  { title: "Ruta del Silpancho y Pique", area: "El Prado y Cala Cala", tag: "Gastronomía", category: "gastronomia", image: foodTraditionalImage, rating: "5.0", time: "3 h" },
  { title: "Danzas y Tradición Viva", area: "Centro Histórico", tag: "Tradición", category: "cultura", image: cultureDanceImage, rating: "4.9", time: "Medio día" },
  { title: "Travesía en Bici por los Valles", area: "Valle Alto", tag: "Aventura", category: "aventura", image: adventureBikeImage, rating: "4.8", time: "4 h" },
];

const quickCards = [
  {
    title: "Alojamientos",
    desc: "Cabañas, hoteles y estancias",
    badge: "15+ opciones",
    icon: "home" as IconName,
    bg: "bg-[#FFF1F2]",
    hoverBg: "hover:bg-[#FFE4E6]",
    border: "border-[#FECDD3]",
    accent: "#D81B60",
    catKey: "naturaleza" as CategoryKey,
  },
  {
    title: "Gastronomía",
    desc: "Silpancho, pique y sabores de mercado",
    badge: "28 sabores",
    icon: "utensils" as IconName,
    bg: "bg-[#FFFBEB]",
    hoverBg: "hover:bg-[#FEF3C7]",
    border: "border-[#FDE68A]",
    accent: "#F7931E",
    catKey: "gastronomia" as CategoryKey,
  },
  {
    title: "Actividades",
    desc: "Trekking, parapente y paseos en el valle",
    badge: "12 rutas",
    icon: "mountain" as IconName,
    bg: "bg-[#ECFDF5]",
    hoverBg: "hover:bg-[#D1FAE5]",
    border: "border-[#A7F3D0]",
    accent: "#4CAF50",
    catKey: "aventura" as CategoryKey,
  },
  {
    title: "Itinerarios",
    desc: "Rutas organizadas de 1 a 7 días",
    badge: "Planes listos",
    icon: "compass" as IconName,
    bg: "bg-[#ECFEFF]",
    hoverBg: "hover:bg-[#CFFAFE]",
    border: "border-[#A5F3FC]",
    accent: "#0097A7",
    catKey: "cultura" as CategoryKey,
  },
];

type CategoryKey = "naturaleza" | "gastronomia" | "cultura" | "aventura";

const categoryPages: Record<CategoryKey, {
  title: string;
  intro: string;
  eyebrow: string;
  hero: string;
  accent: string;
  stats: string[];
  filters: string[];
  highlights: { title: string; place: string; image: string; duration: string; label: string }[];
}> = {
  naturaleza: {
    title: "Respira Cochabamba",
    intro: "Valles fértiles, lagunas y montañas sagradas para bajar el ritmo y volver a conectar con lo esencial.",
    eyebrow: "Naturaleza que transforma",
    hero: natureValleyImage,
    accent: "#4CAF50",
    stats: ["12 espacios naturales", "4 rutas de trekking", "Desde 30 Bs."],
    filters: ["Todos", "Montañas", "Valles", "Miradores"],
    highlights: [
      { title: "Parque Nacional Tunari", place: "Cordillera del Tunari", image: tunariImage, duration: "Día completo", label: "Alta montaña" },
      { title: "Valle de las Ánimas", place: "Área metropolitana", image: natureValleyImage, duration: "4–5 horas", label: "Paisaje" },
      { title: "Bosques y senderos de altura", place: "Tiquipaya", image: natureGreenImage, duration: "3 horas", label: "Caminata suave" },
    ],
  },
  gastronomia: {
    title: "La ciudad que se saborea",
    intro: "En la llajta cada día tiene su plato emblemático. Conoce mercados tradicionales, cocineras de antaño y recetas con historia.",
    eyebrow: "Capital gastronómica de Bolivia",
    hero: foodDishesImage,
    accent: "#F7931E",
    stats: ["28 sabores locales", "7 platos de la semana", "Desde 15 Bs."],
    filters: ["Todos", "Mercados", "Tradicional", "Café y autor"],
    highlights: [
      { title: "La ruta del silpancho", place: "Centro y Cala Cala", image: foodTraditionalImage, duration: "2 horas", label: "Tradición" },
      { title: "Sabores de La Cancha", place: "Mercado La Cancha", image: foodImage, duration: "3 horas", label: "Mercado" },
      { title: "Mesa cochabambina completa", place: "Circuito urbano", image: foodDishesImage, duration: "Medio día", label: "Degustación" },
    ],
  },
  cultura: {
    title: "Historias que siguen vivas",
    intro: "Patrimonio colonial, fiestas populares, textilería de aguayo y voces locales para entender la ciudad más allá de sus postales.",
    eyebrow: "Cultura e identidad viva",
    hero: cultureDanceImage,
    accent: "#7B1FA2",
    stats: ["16 historias locales", "8 espacios culturales", "6 fiestas populares"],
    filters: ["Todos", "Patrimonio", "Fiestas", "Artesanía"],
    highlights: [
      { title: "Palacio Portales", place: "Queru Queru", image: heritageImage, duration: "1–2 horas", label: "Patrimonio" },
      { title: "Danzas de nuestra tierra", place: "Cochabamba", image: cultureDanceImage, duration: "2 horas", label: "Tradición" },
      { title: "Calles con memoria histórica", place: "Centro histórico", image: cultureStreetImage, duration: "3 horas", label: "Recorrido" },
    ],
  },
  aventura: {
    title: "Sube, pedalea, explora",
    intro: "Rutas activas por la cordillera y senderos de altura para descubrir el valle desde otra perspectiva y adrenalina.",
    eyebrow: "Aventura en la llajta",
    hero: adventureHikeImage,
    accent: "#0097A7",
    stats: ["9 rutas activas", "3 niveles de dificultad", "Guías verificados"],
    filters: ["Todos", "Trekking", "Bicicleta", "Escalada"],
    highlights: [
      { title: "Cumbre del Tunari", place: "Cordillera del Tunari", image: adventureHikeImage, duration: "8 horas", label: "Exigente" },
      { title: "Ruta en dos ruedas", place: "Valle de Cochabamba", image: adventureBikeImage, duration: "4 horas", label: "Intermedio" },
      { title: "Senderos entre montañas", place: "Tiquipaya", image: natureValleyImage, duration: "5 horas", label: "Trekking" },
    ],
  },
};

function CategoryPage({
  category,
  onBack,
  favorites,
  toggleFavorite,
}: {
  category: CategoryKey;
  onBack: () => void;
  favorites: string[];
  toggleFavorite: (title: string) => void;
}) {
  const data = categoryPages[category];
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#37474F]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur shadow-sm border-b border-[#E2D9CC]">
        <div className="aguayo-strip h-1.5" />
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-subtitle font-bold text-[#37474F] hover:text-[#D81B60] transition"
          >
            <span className="rotate-180"><Icon name="arrow" size={18} /></span> Volver al inicio
          </button>
          <div className="flex items-center gap-2.5">
            <AndeanDiamond size={20} />
            <span className="font-subtitle text-lg font-bold text-[#37474F] tracking-tight">
              Cochabamba
            </span>
          </div>
          <button
            className="relative rounded-full p-2.5 hover:bg-[#FAF7F2] transition text-[#37474F]"
            aria-label="Favoritos"
          >
            <Icon name="heart" size={21} filled={favorites.length > 0} />
            {favorites.length > 0 && (
              <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-[#D81B60] text-[9px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[460px] overflow-hidden text-white">
          <img src={data.hero} alt={data.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/95 via-[#1E293B]/70 to-transparent" />
          <div className="aguayo-grid absolute right-0 top-0 hidden h-full w-[36%] opacity-60 lg:grid" aria-hidden="true" />
          <div className="relative mx-auto flex min-h-[460px] max-w-[1240px] items-center px-5 py-16 lg:px-8">
            <div className="max-w-[660px]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-3.5 py-1 backdrop-blur">
                <AndeanDiamond size={15} />
                <p className="font-subtitle text-xs font-bold uppercase tracking-[.18em] text-[#F4C430]">{data.eyebrow}</p>
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-tight">{data.title}</h1>
              <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-white/90">{data.intro}</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {data.stats.map((stat) => (
                  <span key={stat} className="rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-subtitle font-semibold backdrop-blur">
                    {stat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Experiences Section */}
        <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">—— SELECCIÓN LOCAL</p>
              <h2 className="section-title">Experiencias imperdibles</h2>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {data.filters.map((filter, index) => (
                <button
                  key={filter}
                  className="rounded-full border border-[#E2D9CC] px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-sm"
                  style={index === 0 ? { backgroundColor: data.accent, borderColor: data.accent, color: "white" } : { backgroundColor: "white", color: "#6D4C41" }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.highlights.map((item, index) => {
              const favorite = favorites.includes(item.title);
              return (
                <article key={item.title} className="group overflow-hidden rounded-[24px] bg-white border border-[#E2D9CC] shadow-md hover:shadow-xl transition">
                  <div className="relative h-60 overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full px-3 py-1 font-subtitle text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md" style={{ backgroundColor: data.accent }}>
                      {item.label}
                    </span>
                    <button
                      onClick={() => toggleFavorite(item.title)}
                      className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full transition shadow-md ${favorite ? "bg-[#D81B60] text-white" : "bg-white/90 text-[#37474F] hover:bg-white"}`}
                      aria-label={`Guardar ${item.title}`}
                    >
                      <Icon name="heart" size={18} filled={favorite} />
                    </button>
                    <span className="absolute bottom-1 left-3 font-display text-[64px] leading-none font-bold text-white/30 select-none">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#6D4C41]">
                      <Icon name="pin" size={14} /> {item.place}
                    </div>
                    <h3 className="font-subtitle text-xl font-bold text-[#37474F]">{item.title}</h3>
                    <div className="mt-5 flex items-center justify-between border-t border-[#E8E3D8] pt-4 text-xs">
                      <span className="flex items-center gap-1.5 text-[#6D4C41]"><Icon name="clock" size={15} /> {item.duration}</span>
                      <button className="flex items-center gap-1 font-subtitle font-bold hover:underline" style={{ color: data.accent }}>
                        Ver detalles <Icon name="arrow" size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mx-auto max-w-[1240px] px-5 pb-20 lg:px-8">
          <div className="overflow-hidden rounded-[28px] text-white shadow-xl" style={{ backgroundColor: data.accent }}>
            <div className="aguayo-strip h-2.5" />
            <div className="flex flex-col items-start justify-between gap-7 p-8 md:flex-row md:items-center md:p-12">
              <div className="max-w-2xl">
                <p className="font-subtitle text-xs font-bold uppercase tracking-[.2em] text-white/80">Hecho a tu medida</p>
                <h2 className="font-display mt-2 text-3xl sm:text-4xl font-bold">Combina estas experiencias en tu propia ruta</h2>
                <p className="mt-3 text-sm leading-6 text-white/90">Organiza tiempos, paradas y presupuestos de la mano de expertos locales.</p>
              </div>
              <button className="shrink-0 rounded-full bg-white px-7 py-3.5 font-subtitle text-sm font-bold shadow-lg transition hover:bg-[#FAF7F2]" style={{ color: data.accent }}>
                Crear mi itinerario →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1E293B] text-white/75">
        <div className="aguayo-strip h-1.5" />
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-7 text-xs">
          <div className="flex items-center gap-2">
            <AndeanDiamond size={16} />
            <span className="font-subtitle font-bold text-white">Cochabamba</span>
            <span className="text-white/60">· Riqsi Rutas</span>
          </div>
          <span className="font-script text-2xl text-[#F4C430]">“Cochabamba, siempre una buena idea”</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("todos");

  // Search state (No redundant Cochabamba location!)
  const [searchQuery, setSearchQuery] = useState("");
  const [travelers, setTravelers] = useState("2 personas");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(2026, 9, 15),
    endDate: new Date(2026, 9, 18),
    label: "15 — 18 de octubre",
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const toggleFavorite = (title: string) => {
    setFavorites((items) =>
      items.includes(title) ? items.filter((item) => item !== title) : [...items, title]
    );
  };

  const handleSearch = () => {
    const activityText = searchQuery ? ` "${searchQuery}"` : "";
    setNotice(`Buscando experiencias${activityText} para ${travelers} entre el ${dateRange.label}.`);
    window.setTimeout(() => setNotice(""), 4000);
  };

  const filteredPlaces = places.filter((p) => {
    if (selectedFilter === "todos") return true;
    return p.category === selectedFilter;
  });

  if (activeCategory) {
    return (
      <CategoryPage
        category={activeCategory}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onBack={() => {
          setActiveCategory(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#37474F] font-sans selection:bg-[#D81B60] selection:text-white">
      {/* Top Aguayo line */}
      <div className="aguayo-strip h-1.5 w-full fixed top-0 left-0 z-50 shadow-sm" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E2D9CC]/70">
        <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between px-5 lg:px-8">
          {/* Logo matching proposal image */}
          <a href="#" className="flex items-center gap-3 group" aria-label="Cochabamba Turismo">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#FAF7F2] border border-[#E2D9CC] shadow-sm transition group-hover:scale-105">
              <AndeanDiamond size={22} />
            </span>
            <div className="flex flex-col">
              <span className="font-subtitle text-xl font-extrabold text-[#37474F] tracking-tight leading-tight">
                Cochabamba
              </span>
              <span className="font-subtitle text-[10px] font-bold tracking-[0.2em] text-[#D81B60]">
                RIQSI RUTAS
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 font-subtitle text-sm font-bold text-[#37474F] md:flex">
            <a className="hover:text-[#D81B60] transition" href="#inicio">Inicio</a>
            <a className="hover:text-[#D81B60] transition" href="#explora">Explora</a>
            <a className="hover:text-[#D81B60] transition" href="#destacados">Cultura</a>
            <a className="hover:text-[#D81B60] transition" href="#planifica">Turismo</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-full border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-1.5 font-subtitle text-xs font-bold text-[#37474F] hover:border-[#D81B60] hover:text-[#D81B60] transition shadow-sm"
              title="Abrir calendario"
            >
              <Icon name="calendar" size={16} />
              <span>{dateRange.label}</span>
            </button>

            <button
              onClick={() =>
                setNotice(
                  favorites.length > 0
                    ? `Tienes ${favorites.length} lugar(es) guardado(s) en favoritos.`
                    : "Aún no tienes favoritos. ¡Haz clic en el corazón de cualquier experiencia!"
                )
              }
              className="relative rounded-full p-2 text-[#37474F] hover:bg-[#FAF7F2] transition"
              aria-label="Ver favoritos"
            >
              <Icon name="heart" size={22} filled={favorites.length > 0} />
              {favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[#D81B60] text-[10px] font-bold text-white shadow-sm">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              className="rounded-full border border-[#E2D9CC] p-2 text-[#37474F] md:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Abrir menú"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="mx-4 mb-4 rounded-2xl bg-white p-5 text-sm shadow-xl md:hidden border border-[#E2D9CC]">
            <a className="block py-2.5 font-subtitle font-bold text-[#37474F]" href="#inicio" onClick={() => setMobileMenu(false)}>Inicio</a>
            <a className="block py-2.5 font-subtitle font-bold text-[#37474F]" href="#explora" onClick={() => setMobileMenu(false)}>Explora</a>
            <a className="block py-2.5 font-subtitle font-bold text-[#37474F]" href="#destacados" onClick={() => setMobileMenu(false)}>Cultura</a>
            <a className="block py-2.5 font-subtitle font-bold text-[#37474F]" href="#planifica" onClick={() => setMobileMenu(false)}>Turismo</a>
            <button
              onClick={() => { setIsCalendarOpen(true); setMobileMenu(false); }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#D81B60] px-5 py-2.5 font-subtitle font-bold text-white shadow"
            >
              <Icon name="calendar" size={17} /> Elegir fechas de viaje
            </button>
          </div>
        )}
      </header>

      <main id="inicio">
        {/* HERO SECTION matching mobile mockup */}
        <section className="relative min-h-[580px] lg:min-h-[660px] overflow-hidden bg-[#1E293B] text-white">
          <img
            src={heroImage}
            alt="Panorámica de Cochabamba, Cristo de la Concordia y Cordillera del Tunari"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/95 via-[#1E293B]/55 to-black/30" />

          {/* Aguayo decorative corner banner as in the user proposal image */}
          <div className="absolute right-0 bottom-0 hidden md:block w-72 h-72 pointer-events-none opacity-85">
            <div className="aguayo-strip absolute bottom-0 right-0 w-96 h-12 -rotate-45 translate-x-20 translate-y-8 shadow-2xl" />
            <div className="aguayo-strip absolute bottom-0 right-0 w-96 h-5 -rotate-45 translate-x-28 translate-y-16 shadow-lg" />
          </div>

          <div className="relative mx-auto flex min-h-[580px] lg:min-h-[660px] max-w-[1240px] flex-col justify-center px-5 py-20 lg:px-8">
            <div className="max-w-[760px]">
              {/* "BIENVENIDOS A" badge from mockup */}
              <p className="font-subtitle text-xs sm:text-sm font-extrabold uppercase tracking-[0.28em] text-[#F4C430] mb-3">
                BIENVENIDOS A
              </p>

              {/* Title Qhapi / Serif Display */}
              <h1 className="font-display text-5xl sm:text-7xl lg:text-[84px] font-bold tracking-tight leading-[1.02]">
                Cochabamba
              </h1>

              {/* Subtitle from mockup in Montserrat Alternates */}
              <p className="font-subtitle mt-4 text-lg sm:text-2xl font-medium text-white/95 leading-snug">
                Naturaleza, cultura y tradición en un solo lugar.
              </p>

              {/* CTA button from mockup in Fucsia Andino */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#explora"
                  className="inline-flex items-center gap-2 rounded-full bg-[#D81B60] px-8 py-3.5 font-subtitle text-sm sm:text-base font-bold text-white shadow-xl shadow-[#D81B60]/40 transition hover:bg-[#b0144c] hover:scale-105 active:scale-95"
                >
                  Explorar <Icon name="arrow" size={18} />
                </a>

                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 bg-black/30 backdrop-blur px-6 py-3 font-subtitle text-sm font-bold text-white transition hover:bg-white hover:text-[#37474F]"
                >
                  <Icon name="calendar" size={18} /> Planificar fechas
                </button>
              </div>
            </div>

            {/* MODERN INTEGRATED SEARCH BOX (Without redundant Cochabamba location) */}
            <div className="mt-12 max-w-[1080px] rounded-3xl bg-white p-3 text-[#37474F] shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-[#E2D9CC]">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.3fr_.9fr_auto] lg:divide-x lg:divide-[#E2D9CC]">
                {/* 1. ¿Qué experiencia buscas? */}
                <div className="search-field">
                  <span className="search-icon"><Icon name="search" size={22} /></span>
                  <div className="w-full">
                    <small>¿Qué quieres experimentar?</small>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Gastronomía, trekking, museos..."
                      aria-label="Buscar experiencia"
                    />
                  </div>
                </div>

                {/* 2. ¿Cuándo? Calendario Prominente */}
                <div
                  className="search-field cursor-pointer group"
                  onClick={() => setIsCalendarOpen(true)}
                  title="Haz clic para abrir el calendario interactivo"
                >
                  <span className="search-icon text-[#F7931E] group-hover:scale-110 transition">
                    <Icon name="calendar" size={22} />
                  </span>
                  <div className="w-full">
                    <small>¿Cuándo viajas?</small>
                    <div className="flex items-center justify-between">
                      <span className="font-subtitle text-[14px] sm:text-[15px] font-bold text-[#37474F] truncate">
                        {dateRange.label}
                      </span>
                      <span className="ml-2 rounded-full bg-[#D81B60]/10 px-2.5 py-0.5 font-subtitle text-[10px] font-bold text-[#D81B60] shrink-0 border border-[#D81B60]/20">
                        Calendario 📅
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Viajeros */}
                <div className="search-field">
                  <span className="search-icon text-[#4CAF50]"><Icon name="people" size={22} /></span>
                  <div className="w-full">
                    <small>Viajeros</small>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                      aria-label="Cantidad de viajeros"
                      className="font-subtitle font-bold text-[14px]"
                    >
                      <option value="1 persona">1 persona</option>
                      <option value="2 personas">2 personas</option>
                      <option value="Familia (3–5)">Familia (3–5)</option>
                      <option value="Grupo (6+)">Grupo (6+)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Botón de búsqueda */}
                <div className="flex items-center p-1">
                  <button
                    onClick={handleSearch}
                    className="w-full h-full min-h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#D81B60] px-7 font-subtitle text-sm font-extrabold text-white shadow-lg shadow-[#D81B60]/30 transition hover:bg-[#b0144c] hover:shadow-xl active:scale-95"
                  >
                    <span>Buscar</span>
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK CATEGORY CARDS SECTION (Matching proposal mockup) */}
        <section id="explora" className="mx-auto max-w-[1240px] px-5 -mt-6 sm:-mt-10 relative z-20 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {quickCards.map((card) => (
              <button
                key={card.title}
                onClick={() => {
                  setActiveCategory(card.catKey);
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
                  <span className="font-subtitle text-[10px] font-extrabold uppercase tracking-wider text-[#6D4C41] bg-white/80 px-2 py-0.5 rounded-full shadow-xs">
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

        {/* DESTINOS DESTACADOS: "Lugares que te enamoran" (Mockup title) */}
        <section id="destacados" className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">—— DESTINOS DESTACADOS</p>
              <h2 className="section-title">Lugares que te enamoran</h2>
              <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-[#6D4C41]">
                Desde la imponente Cordillera hasta los encantadores valles, Cochabamba es un destino lleno de vida.
              </p>
            </div>

            {/* Filter pills styled as in the mockup */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter("todos")}
                className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                  selectedFilter === "todos"
                    ? "bg-[#D81B60] text-white shadow-md shadow-[#D81B60]/25"
                    : "bg-white text-[#6D4C41] border border-[#E2D9CC] hover:border-[#D81B60]"
                }`}
              >
                Ver todos →
              </button>
              <button
                onClick={() => setSelectedFilter("naturaleza")}
                className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                  selectedFilter === "naturaleza"
                    ? "bg-[#4CAF50] text-white"
                    : "bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"
                }`}
              >
                Naturaleza
              </button>
              <button
                onClick={() => setSelectedFilter("cultura")}
                className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                  selectedFilter === "cultura"
                    ? "bg-[#F7931E] text-white"
                    : "bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
                }`}
              >
                Cultura
              </button>
              <button
                onClick={() => setSelectedFilter("gastronomia")}
                className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                  selectedFilter === "gastronomia"
                    ? "bg-[#D81B60] text-white"
                    : "bg-[#FFE4E6] text-[#BE123C] hover:bg-[#FECDD3]"
                }`}
              >
                Gastronomía
              </button>
              <button
                onClick={() => setSelectedFilter("aventura")}
                className={`rounded-full px-4 py-1.5 font-subtitle text-xs font-bold transition shadow-xs ${
                  selectedFilter === "aventura"
                    ? "bg-[#0097A7] text-white"
                    : "bg-[#CFFAFE] text-[#0E7490] hover:bg-[#A5F3FC]"
                }`}
              >
                Aventura
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPlaces.map((place) => {
              const isFavorite = favorites.includes(place.title);
              return (
                <article
                  key={place.title}
                  className="group overflow-hidden rounded-[26px] bg-white border border-[#E2D9CC] shadow-md hover:shadow-2xl transition duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3.5 top-3.5 rounded-full bg-white/95 px-3 py-1 font-subtitle text-[10px] font-black uppercase tracking-wider text-[#37474F] shadow-md backdrop-blur">
                      {place.tag}
                    </span>
                    <button
                      onClick={() => toggleFavorite(place.title)}
                      className={`absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full shadow-md backdrop-blur transition ${
                        isFavorite ? "bg-[#D81B60] text-white scale-110" : "bg-white/90 text-[#37474F] hover:bg-white"
                      }`}
                      aria-label={`Guardar ${place.title}`}
                    >
                      <Icon name="heart" size={18} filled={isFavorite} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#6D4C41]">
                          <Icon name="pin" size={14} /> {place.area}
                        </span>
                        <span className="flex items-center gap-1 font-subtitle font-bold text-[#37474F]">
                          <span className="text-[#F4C430] text-sm">★</span> {place.rating}
                        </span>
                      </div>
                      <h3 className="font-subtitle text-lg font-bold text-[#37474F] group-hover:text-[#D81B60] transition leading-snug">
                        {place.title}
                      </h3>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#E8E3D8] pt-4 text-xs font-semibold">
                      <span className="flex items-center gap-1 text-[#6D4C41]">
                        <Icon name="clock" size={14} /> {place.time}
                      </span>
                      <button
                        onClick={() => {
                          setNotice(`Abriendo experiencia: ${place.title}`);
                          window.setTimeout(() => setNotice(""), 3500);
                        }}
                        className="font-subtitle font-bold text-[#D81B60] hover:text-[#7B1FA2] transition flex items-center gap-1"
                      >
                        Ver más →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CULTURAL QUOTE CARD (From proposal mockup in Allura font) */}
        <section className="mx-auto max-w-[1240px] px-5 pb-16 lg:px-8">
          <div className="rounded-[32px] bg-gradient-to-r from-[#FFF8EE] via-[#FFF1F2] to-[#F0FDF4] p-8 sm:p-14 text-center border border-[#FDE68A] shadow-md relative overflow-hidden">
            {/* Mountain line art icon */}
            <div className="flex justify-center text-[#6D4C41] mb-2">
              <MountainLogo className="w-10 h-10 text-[#37474F]" />
            </div>

            {/* Quote in Allura font */}
            <p className="font-script text-3xl sm:text-5xl lg:text-6xl text-[#37474F] font-normal leading-tight my-4">
              “Cochabamba, siempre una buena idea”
            </p>

            {/* Diamond emblem underneath */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <span className="h-px w-12 bg-[#D81B60]/30" />
              <AndeanDiamond size={22} />
              <span className="h-px w-12 bg-[#F7931E]/30" />
            </div>
          </div>
        </section>

        {/* SECTION: PLANIFICA TU RUTA */}
        <section id="planifica" className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="relative min-h-[480px] overflow-hidden rounded-[32px] bg-[#1E293B] shadow-xl">
            <img
              src={traditionImage}
              alt="Tradición y aguayos bolivianos"
              className="absolute inset-0 h-full w-full object-cover object-top opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/25 to-transparent" />
            <div className="absolute bottom-0 p-8 text-white sm:p-10">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#F4C430] px-3.5 py-1 font-subtitle text-[11px] font-extrabold uppercase tracking-widest text-[#37474F]">
                <AndeanDiamond size={13} /> Identidad local
              </span>
              <p className="font-display text-3xl sm:text-4xl leading-tight font-bold">
                Una ruta no solo te lleva.<br />También te cuenta quiénes somos.
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">—— TU VIAJE, MEJOR PENSADO</p>
            <h2 className="section-title max-w-xl">Arma una ruta tan única como tú</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#6D4C41]">
              Dinos qué disfrutas y nuestro planificador organiza distancias, tiempos y pequeños negocios locales recomendados por la comunidad cochabambina.
            </p>

            <div className="my-8 space-y-4">
              {[
                ["01", "Elige tus pasiones", "Cultura viva, gastronomía de la llajta, valles y montaña."],
                ["02", "Define tus fechas", "Usa nuestro calendario interactivo para armar tu fin de semana o semana entera."],
                ["03", "Recibe tu ruta lista", "Optimizada con transportes, costos reales y sugerencias de paradas."],
              ].map(([number, title, text]) => (
                <div className="flex gap-4 items-start" key={number}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] font-subtitle text-sm font-black text-[#D81B60]">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-subtitle font-bold text-[#37474F] text-[16px]">{title}</h3>
                    <p className="mt-0.5 text-sm text-[#6D4C41]">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#D81B60] px-8 py-3.5 font-subtitle text-sm font-extrabold text-white transition hover:bg-[#b0144c] shadow-lg shadow-[#D81B60]/30 hover:scale-105 active:scale-95"
            >
              <Icon name="sparkle" size={18} /> Iniciar mi planificación →
            </button>
          </div>
        </section>

        {/* PROPOSITO BANNER */}
        <section className="pattern-band bg-[#D81B60] text-white">
          <div className="aguayo-strip h-2.5" />
          <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 px-5 py-12 sm:flex-row sm:items-center lg:px-8">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-subtitle text-xs font-bold uppercase tracking-[.25em] text-[#F4C430]">Viaja con propósito</p>
                <span className="font-script text-3xl text-white">¡Bienvenidos!</span>
              </div>
              <h2 className="font-display mt-2 text-3xl sm:text-4xl font-bold">
                Descubre más. Apoya a los productores y artesanos locales.
              </h2>
            </div>
            <button
              onClick={() => setNotice("¡Gracias por apoyar el turismo comunitario en Cochabamba!")}
              className="shrink-0 rounded-full bg-white px-7 py-3.5 font-subtitle text-sm font-bold text-[#D81B60] shadow-xl transition hover:bg-[#FAF7F2] hover:scale-105"
            >
              Conoce nuestra comunidad →
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER matching proposal image */}
      <footer className="bg-[#1E293B] text-white/80">
        <div className="aguayo-strip h-1.5" />
        <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-white/10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <MountainLogo className="w-8 h-8 text-[#F4C430]" />
              <div className="flex flex-col">
                <span className="font-subtitle text-xl font-bold text-white tracking-tight">Cochabamba</span>
                <span className="font-subtitle text-[10px] tracking-widest text-[#F4C430]">BOLIVIA</span>
              </div>
            </div>

            {/* Cultural slogan */}
            <p className="font-script text-2xl text-[#F4C430] text-center">
              Tradición que se siente en cada rincón.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 text-white/90">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2 rounded-full hover:bg-white/10 hover:text-[#D81B60] transition">
                <Icon name="instagram" size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 rounded-full hover:bg-white/10 hover:text-[#F7931E] transition">
                <Icon name="facebook" size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="p-2 rounded-full hover:bg-white/10 hover:text-[#D81B60] transition">
                <Icon name="youtube" size={20} />
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-subtitle">
            <p>© {new Date().getFullYear()} Cochabamba Turismo · Riqsi Rutas. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacidad</a>
              <a href="#" className="hover:text-white transition">Términos</a>
              <a href="#" className="hover:text-white transition">Contacto</a>
            </div>
          </div>
        </div>

        {/* Final Aguayo bottom border as in the mockup */}
        <div className="aguayo-strip h-2.5 w-full" />
      </footer>

      {/* Interactive Modal Calendar */}
      <CalendarPicker
        isOpen={isCalendarOpen}
        value={dateRange}
        onChange={(newRange) => setDateRange(newRange)}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Toast Notification */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl bg-[#1E293B] border-2 border-[#D81B60] px-5 py-4 text-center font-subtitle text-sm font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center justify-center gap-2.5">
            <AndeanDiamond size={18} />
            <span>{notice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
