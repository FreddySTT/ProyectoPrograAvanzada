import { useState } from "react";
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
  | "user";

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

const places = [
  { title: "Cristo de la Concordia", area: "Cercado", tag: "Imperdible", image: heroImage, rating: "4.8", time: "2–3 h" },
  { title: "Palacio Portales", area: "Queru Queru", tag: "Cultura", image: heritageImage, rating: "4.7", time: "1–2 h" },
  { title: "Parque Nacional Tunari", area: "Cordillera", tag: "Naturaleza", image: tunariImage, rating: "4.9", time: "Día completo" },
  { title: "Mercados con sabor local", area: "La Cancha", tag: "Gastronomía", image: foodImage, rating: "4.6", time: "2 h" },
];

const categories = [
  { key: "naturaleza", label: "Naturaleza", detail: "12 lugares", color: "bg-[#dbe9dc]", icon: "compass" as IconName },
  { key: "gastronomia", label: "Gastronomía", detail: "28 sabores", color: "bg-[#f8dfc9]", icon: "star" as IconName },
  { key: "cultura", label: "Cultura viva", detail: "16 historias", color: "bg-[#eadcf1]", icon: "sparkle" as IconName },
  { key: "aventura", label: "Aventura", detail: "9 rutas", color: "bg-[#d9e7f4]", icon: "route" as IconName },
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
    intro: "Valles, lagunas y montañas para bajar el ritmo y volver a conectar con lo esencial.",
    eyebrow: "Naturaleza que transforma",
    hero: natureValleyImage,
    accent: "#23806b",
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
    intro: "En la llajta cada día tiene un plato. Conoce mercados, cocineras y recetas con historia.",
    eyebrow: "Capital gastronómica",
    hero: foodDishesImage,
    accent: "#dc552f",
    stats: ["28 sabores locales", "7 platos de la semana", "Desde 15 Bs."],
    filters: ["Todos", "Mercados", "Tradicional", "Café y autor"],
    highlights: [
      { title: "La ruta del silpancho", place: "Centro y Cala Cala", image: foodTraditionalImage, duration: "2 horas", label: "Miércoles" },
      { title: "Sabores de La Cancha", place: "Mercado La Cancha", image: foodImage, duration: "3 horas", label: "Mercado" },
      { title: "Mesa cochabambina", place: "Circuito urbano", image: foodDishesImage, duration: "Medio día", label: "Degustación" },
    ],
  },
  cultura: {
    title: "Historias que siguen vivas",
    intro: "Patrimonio, fiestas, artesanía y voces locales para entender la ciudad más allá de sus postales.",
    eyebrow: "Cultura e identidad",
    hero: cultureDanceImage,
    accent: "#7d3f98",
    stats: ["16 historias locales", "8 espacios culturales", "6 fiestas populares"],
    filters: ["Todos", "Patrimonio", "Fiestas", "Artesanía"],
    highlights: [
      { title: "Palacio Portales", place: "Queru Queru", image: heritageImage, duration: "1–2 horas", label: "Patrimonio" },
      { title: "Danzas de nuestra tierra", place: "Cochabamba", image: cultureDanceImage, duration: "2 horas", label: "Tradición" },
      { title: "Calles con memoria", place: "Centro histórico", image: cultureStreetImage, duration: "3 horas", label: "Recorrido" },
    ],
  },
  aventura: {
    title: "Sube, pedalea, explora",
    intro: "Rutas activas para descubrir el valle desde otra perspectiva, siempre a tu propio ritmo.",
    eyebrow: "Aventura en la llajta",
    hero: adventureHikeImage,
    accent: "#2769a8",
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
    <div className="min-h-screen bg-[#fbfaf6] text-[#1d2925]">
      <header className="relative z-20 bg-[#102f2b] text-white">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold hover:text-[#f6cf79]">
            <span className="rotate-180"><Icon name="arrow" size={18} /></span> Volver al inicio
          </button>
          <span className="font-display font-bold tracking-[.12em]">RIQSI <em className="text-[#f6cf79] not-italic">RUTA</em></span>
          <button className="relative rounded-full p-2.5 hover:bg-white/10" aria-label="Favoritos">
            <Icon name="heart" size={21} filled={favorites.length > 0} />
            {favorites.length > 0 && <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-[#dc552f] text-[9px] font-bold">{favorites.length}</span>}
          </button>
        </div>
      </header>

      <main>
        <section className="relative min-h-[520px] overflow-hidden text-white">
          <img src={data.hero} alt={data.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102f2b]/95 via-[#102f2b]/65 to-transparent" />
          <div className="wiphala-grid absolute right-0 top-0 hidden h-full w-[36%] opacity-75 lg:grid" aria-hidden="true" />
          <div className="relative mx-auto flex min-h-[520px] max-w-[1240px] items-center px-5 py-20 lg:px-8">
            <div className="max-w-[660px]">
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[.22em] text-[#ffd76e]">{data.eyebrow}</p>
              <h1 className="font-display text-5xl leading-[1.02] font-semibold tracking-[-.03em] sm:text-7xl">{data.title}</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">{data.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {data.stats.map((stat) => <span key={stat} className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur">{stat}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Selección local</p>
              <h2 className="section-title">Experiencias para empezar</h2>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {data.filters.map((filter, index) => (
                <button key={filter} className="category-filter" style={index === 0 ? { backgroundColor: data.accent, borderColor: data.accent, color: "white" } : undefined}>{filter}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {data.highlights.map((item, index) => {
              const favorite = favorites.includes(item.title);
              return (
                <article key={item.title} className="category-card group" style={{ "--accent": data.accent } as React.CSSProperties}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white" style={{ backgroundColor: data.accent }}>{item.label}</span>
                    <button onClick={() => toggleFavorite(item.title)} className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full ${favorite ? "bg-[#e23d35] text-white" : "bg-white/90"}`} aria-label={`Guardar ${item.title}`}>
                      <Icon name="heart" size={18} filled={favorite} />
                    </button>
                    <span className="absolute bottom-0 left-0 font-display text-[76px] leading-none font-semibold text-white/25">0{index + 1}</span>
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs text-[#6b746f]"><Icon name="pin" size={14} /> {item.place}</div>
                    <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                    <div className="mt-5 flex items-center justify-between border-t border-[#ece8df] pt-4 text-xs">
                      <span className="flex items-center gap-1.5 text-[#6b746f]"><Icon name="clock" size={15} /> {item.duration}</span>
                      <button className="flex items-center gap-1 font-bold" style={{ color: data.accent }}>Ver experiencia <Icon name="arrow" size={15} /></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 pb-20 lg:px-8">
          <div className="overflow-hidden rounded-[28px] text-white" style={{ backgroundColor: data.accent }}>
            <div className="wiphala-strip h-4" />
            <div className="flex flex-col items-start justify-between gap-7 p-8 md:flex-row md:items-center md:p-12">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">Hecho a tu medida</p>
                <h2 className="font-display mt-2 text-3xl sm:text-4xl">Combina estas experiencias en una sola ruta</h2>
                <p className="mt-3 text-sm leading-6 text-white/80">Riqsi organiza tiempos, distancias y paradas según tu presupuesto.</p>
              </div>
              <button className="shrink-0 rounded-full bg-white px-6 py-3.5 text-sm font-bold" style={{ color: data.accent }}>Crear mi itinerario</button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-[#102f2b] px-5 py-7 text-center text-xs text-white/60">RIQSI RUTA · Cochabamba, Bolivia</footer>
    </div>
  );
}

export default function App() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);

  const toggleFavorite = (title: string) => {
    setFavorites((items) => (items.includes(title) ? items.filter((item) => item !== title) : [...items, title]));
  };

  const explore = () => {
    setNotice("Encontramos 34 experiencias para tu viaje a Cochabamba.");
    window.setTimeout(() => setNotice(""), 3500);
  };

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
    <div className="min-h-screen bg-[#fbfaf6] text-[#1d2925]">
      <header className="absolute inset-x-0 top-0 z-30 text-white">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <a href="#" className="flex items-center gap-3" aria-label="Riqsi Ruta, inicio">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/45 bg-white/10 backdrop-blur">
              <Icon name="compass" size={23} />
            </span>
            <span className="leading-none">
              <strong className="block font-display text-[19px] tracking-[.09em]">RIQSI</strong>
              <span className="text-[10px] font-semibold tracking-[.28em] text-[#f6cf79]">RUTA</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a className="nav-link" href="#descubre">Descubre</a>
            <a className="nav-link" href="#experiencias">Experiencias</a>
            <a className="nav-link" href="#planifica">Planifica tu ruta</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button className="rounded-full p-2.5 hover:bg-white/10" aria-label="Favoritos">
              <Icon name="heart" size={21} filled={favorites.length > 0} />
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">
              <Icon name="user" size={17} /> Ingresar
            </button>
          </div>
          <button className="rounded-full border border-white/30 p-2.5 md:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menú">
            <Icon name="menu" />
          </button>
        </div>
        {mobileMenu && (
          <div className="mx-4 rounded-2xl bg-[#173f38] p-5 text-sm shadow-2xl md:hidden">
            <a className="block py-2" href="#descubre">Descubre</a>
            <a className="block py-2" href="#experiencias">Experiencias</a>
            <a className="block py-2" href="#planifica">Planifica tu ruta</a>
            <button className="mt-3 rounded-full bg-white px-5 py-2.5 font-semibold text-[#173f38]">Ingresar</button>
          </div>
        )}
      </header>

      <main>
        <section className="relative min-h-[690px] overflow-hidden bg-[#173f38] text-white">
          <img src={heroImage} alt="Vista panorámica de Cochabamba y sus montañas" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,35,31,.87)_0%,rgba(8,35,31,.58)_47%,rgba(8,35,31,.15)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#0c302b]/80 to-transparent" />
          <div className="relative mx-auto flex min-h-[690px] max-w-[1240px] items-center px-5 pt-24 lg:px-8">
            <div className="w-full pb-16 pt-20">
              <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.18em] text-[#f6cf79]">
                <span className="h-px w-8 bg-[#f6cf79]" /> El corazón de Bolivia te espera
              </div>
              <h1 className="font-display max-w-[730px] text-5xl leading-[1.03] font-semibold tracking-[-.035em] sm:text-6xl lg:text-[76px]">
                Conoce la llajta<br />
                <span className="italic text-[#f6cf79]">a tu manera.</span>
              </h1>
              <p className="mt-6 max-w-[600px] text-base leading-7 text-white/80 sm:text-lg">
                Destinos, sabores e historias locales reunidos para crear un viaje que realmente se sienta tuyo.
              </p>

              <div className="mt-10 max-w-[1100px] rounded-[22px] bg-white p-2 text-[#1d2925] shadow-[0_20px_55px_rgba(7,25,22,.32)]">
                <div className="grid md:grid-cols-[1.35fr_1fr_.75fr_auto] md:divide-x md:divide-[#deddd7]">
                  <label className="search-field">
                    <span className="search-icon"><Icon name="pin" /></span>
                    <span><small>¿A dónde quieres ir?</small><input defaultValue="Cochabamba" aria-label="Destino" /></span>
                  </label>
                  <label className="search-field">
                    <span className="search-icon"><Icon name="calendar" /></span>
                    <span><small>¿Cuándo?</small><input type="text" defaultValue="15 — 18 de agosto" aria-label="Fechas" /></span>
                  </label>
                  <label className="search-field">
                    <span className="search-icon"><Icon name="people" /></span>
                    <span><small>Viajeros</small><select defaultValue="2" aria-label="Viajeros"><option value="1">1 persona</option><option value="2">2 personas</option><option value="3">3 personas</option><option value="4">4+ personas</option></select></span>
                  </label>
                  <button onClick={explore} className="m-1 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#dc552f] px-7 font-bold text-white transition hover:bg-[#c94725]">
                    <Icon name="search" size={19} /> Explorar
                  </button>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-white/70"><Icon name="sparkle" size={15} /> Recomendaciones pensadas según tus gustos, tiempo y presupuesto.</p>
            </div>
          </div>
        </section>

        <section id="descubre" className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Empieza por lo que te mueve</p>
              <h2 className="section-title">¿Qué quieres descubrir?</h2>
            </div>
            <a href="#experiencias" className="inline-flex items-center gap-2 text-sm font-bold text-[#b54428]">Ver todo Cochabamba <Icon name="arrow" size={18} /></a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.label}
                onClick={() => {
                  setActiveCategory(category.key as CategoryKey);
                  window.scrollTo({ top: 0 });
                }}
                className={`${category.color} group flex items-center gap-4 rounded-[20px] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/70 text-[#173f38]"><Icon name={category.icon} /></span>
                <span className="flex-1"><strong className="block text-[15px]">{category.label}</strong><small className="text-[#5e6964]">{category.detail}</small></span>
                <Icon name="chevron" size={18} />
              </button>
            ))}
          </div>
        </section>

        <section id="experiencias" className="bg-[#f1eee6] py-20">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Elegidos para ti</p>
                <h2 className="section-title">Cochabamba, sin filtros</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#69736e]">Lugares esenciales y rincones que los cochabambinos quieren compartir.</p>
              </div>
              <div className="flex gap-2">
                <button className="filter-chip active">Todos</button><button className="filter-chip">Cerca de ti</button><button className="filter-chip">Mejor valorados</button>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {places.map((place) => {
                const isFavorite = favorites.includes(place.title);
                return (
                  <article key={place.title} className="group overflow-hidden rounded-[22px] bg-white shadow-[0_5px_22px_rgba(31,45,40,.06)]">
                    <div className="relative h-52 overflow-hidden">
                      <img src={place.image} alt={place.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur">{place.tag}</span>
                      <button onClick={() => toggleFavorite(place.title)} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${isFavorite ? "bg-[#dc552f] text-white" : "bg-white/90 text-[#26332e]"}`} aria-label={`Guardar ${place.title}`}>
                        <Icon name="heart" size={18} filled={isFavorite} />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-[#68736e]"><Icon name="pin" size={14} /> {place.area}</span>
                        <span className="flex items-center gap-1 font-bold"><span className="text-[#e9a719]">★</span> {place.rating}</span>
                      </div>
                      <h3 className="font-display min-h-[48px] text-xl leading-6 font-semibold">{place.title}</h3>
                      <div className="mt-4 flex items-center justify-between border-t border-[#eeeae2] pt-4 text-xs text-[#68736e]">
                        <span className="flex items-center gap-1.5"><Icon name="clock" size={15} /> {place.time}</span>
                        <button className="font-bold text-[#b54428]">Ver lugar</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="planifica" className="mx-auto grid max-w-[1240px] gap-12 px-5 py-24 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="relative min-h-[520px] overflow-hidden rounded-[30px] bg-[#173f38]">
            <img src={traditionImage} alt="Tradición y cultura boliviana" className="absolute inset-0 h-full w-full object-cover object-top opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102f2b] via-[#102f2b]/10 to-transparent" />
            <div className="absolute bottom-0 p-7 text-white sm:p-9">
              <span className="mb-3 inline-flex rounded-full bg-[#f2c66b] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#173f38]">Identidad local</span>
              <p className="font-display text-3xl leading-tight">Una ruta no solo te lleva.<br />También te cuenta quiénes somos.</p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Tu viaje, mejor pensado</p>
            <h2 className="section-title max-w-xl">Arma una ruta tan única como tú</h2>
            <p className="mt-5 max-w-xl leading-7 text-[#68736e]">Cuéntanos qué disfrutas y Riqsi crea un itinerario inteligente con distancias, tiempos y pequeños negocios locales que vale la pena conocer.</p>
            <div className="my-8 space-y-5">
              {[
                ["01", "Elige tus intereses", "Cultura, naturaleza, sabores, aventura o un poco de todo."],
                ["02", "Ajusta tiempo y presupuesto", "Desde una tarde libre hasta una semana completa."],
                ["03", "Recibe tu ruta", "Optimizada, editable y disponible incluso sin conexión."],
              ].map(([number, title, text]) => (
                <div className="flex gap-4" key={number}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d8d5cc] text-xs font-extrabold text-[#b54428]">{number}</span>
                  <div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-[#68736e]">{text}</p></div>
                </div>
              ))}
            </div>
            <button onClick={() => setNotice("Tu planificador inteligente estará listo en el próximo paso.")} className="inline-flex items-center gap-2 rounded-full bg-[#173f38] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#245c52]">
              <Icon name="sparkle" size={18} /> Crear mi ruta
            </button>
          </div>
        </section>

        <section className="pattern-band bg-[#dc552f] text-white">
          <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 px-5 py-12 sm:flex-row sm:items-center lg:px-8">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ffd890]">Viaja con propósito</p><h2 className="font-display mt-2 text-3xl sm:text-4xl">Descubre más. Deja algo bueno.</h2></div>
            <button className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#a83820]">Conoce nuestra comunidad</button>
          </div>
        </section>
      </main>

      <footer className="bg-[#102f2b] text-white/70">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-5 px-5 py-8 text-xs sm:flex-row sm:items-center lg:px-8">
          <span className="font-display text-base font-bold tracking-widest text-white">RIQSI <em className="text-[#f6cf79] not-italic">RUTA</em></span>
          <p>Hecho desde Cochabamba para quienes quieren conocerla de verdad.</p>
          <div className="flex gap-5"><a href="#">Privacidad</a><a href="#">Contacto</a><a href="#">Ayuda</a></div>
        </div>
      </footer>

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#173f38] px-5 py-4 text-center text-sm font-semibold text-white shadow-2xl">{notice}</div>}
    </div>
  );
}
