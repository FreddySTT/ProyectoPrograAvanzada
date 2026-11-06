import { useState, useEffect, useMemo } from "react";
import { FlaskCrudDemo } from "./components/FlaskCrudDemo";
import { CalendarPicker, type DateRange } from "./components/CalendarPicker";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { AdminBar } from "./components/AdminBar";
import { AdminPlaceModal } from "./components/AdminPlaceModal";
import { AdminUsersModal } from "./components/AdminUsersModal";
import { AdminAnnouncementModal } from "./components/AdminAnnouncementModal";
import { AdminPortalModal } from "./components/AdminPortalModal";
import { INITIAL_PLACES, INITIAL_ANNOUNCEMENT } from "./data/initialData";
import {
  subscribeToPlaces,
  savePlace,
  deletePlace,
  subscribeToAnnouncement,
  saveAnnouncement,
  getLocalPlaces,
  getLocalAnnouncement,
} from "./supabase/services";
import type { PlaceItem, Announcement } from "./types/auth";

// ─── Atomic / Molecular / Organism components ────────────────────────────────
import { Navbar } from "./components/organisms/Navbar/Navbar";
import { HeroSection } from "./components/organisms/HeroSection/HeroSection";
import { QuickCategorySection } from "./components/organisms/QuickCategorySection/QuickCategorySection";
import { PlacesSection } from "./components/organisms/PlacesSection/PlacesSection";
import { TripPlannerSection } from "./components/organisms/TripPlannerSection/TripPlannerSection";
import { Footer } from "./components/organisms/Footer/Footer";
import { ImageZoomModal, type ZoomModalData } from "./components/molecules/ImageZoomModal/ImageZoomModal";
import { PaymentModal } from "./components/organisms/PaymentModal/PaymentModal";
import { PlaceDetailModal } from "./components/molecules/PlaceDetailModal/PlaceDetailModal";
import { ZoomImage } from "./components/atoms/ZoomImage/ZoomImage";
import type { SearchOption } from "./components/molecules/SearchCombobox/SearchCombobox";
import { Icon } from "./components/atoms/Icon/Icon";

// ─── Images ───────────────────────────────────────────────────────────────────
import natureValleyImage from "./assets/naturaleza-valle.jpg";
import natureGreenImage from "./assets/naturaleza-verde.jpg";
import tunariImage from "./assets/tunari.jpg";
import foodDishesImage from "./assets/comida-platos.jpg";
import foodTraditionalImage from "./assets/comida-tradicional.jpg";
import foodImage from "./assets/gastronomia.jpg";
import saltenaImage from "./assets/gastronomia-saltena.jpg";
import heritageImage from "./assets/patrimonio.jpg";
import cultureDanceImage from "./assets/cultura-danza.jpg";
import cultureStreetImage from "./assets/cultura-calle.jpg";
import adventureHikeImage from "./assets/aventura-caminata.jpg";
import adventureBikeImage from "./assets/aventura-bici.jpg";

// ─── Type Definitions ─────────────────────────────────────────────────────────
type CategoryKey = "naturaleza" | "gastronomia" | "cultura" | "aventura";

// Normalizador de texto para búsquedas
const cleanText = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// ─── Category Page Data ───────────────────────────────────────────────────────
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

// ─── Andean Diamond SVG helper ───────────────────────────────────────────────
function AndeanDiamond({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block" aria-hidden="true">
      <polygon points="12,2 16,7 12,12 8,7" fill="#D81B60" />
      <polygon points="12,12 16,17 12,22 8,17" fill="#F4C430" />
      <polygon points="2,12 7,8 12,12 7,16" fill="#4CAF50" />
      <polygon points="12,12 17,8 22,12 17,16" fill="#F7931E" />
      <circle cx="12" cy="12" r="2.2" fill="#7B1FA2" />
    </svg>
  );
}

// ─── Category Page (sub-view) with interactive Zoom on every food / place card ──
function CategoryPage({
  category,
  onBack,
  favorites,
  toggleFavorite,
  onZoomClick,
  onOpenDetail,
  onBookExperience,
}: {
  category: CategoryKey;
  onBack: () => void;
  favorites: string[];
  toggleFavorite: (title: string) => void;
  onZoomClick: (data: ZoomModalData) => void;
  onOpenDetail: (title: string) => void;
  onBookExperience: (title: string) => void;
}) {
  const data = categoryPages[category];
  const [showAlternateHero, setShowAlternateHero] = useState(false);

  useEffect(() => {
    if (category === "gastronomia") {
      setShowAlternateHero(false);
      const timer = setTimeout(() => setShowAlternateHero(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowAlternateHero(false);
    }
  }, [category]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
        <div className="aguayo-strip h-1" />
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 lg:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-subtitle font-bold text-slate-700 hover:text-rose-700 transition cursor-pointer"
          >
            <span className="rotate-180 inline-block"><Icon name="arrow" size={16} /></span>
            <span>Volver al inicio</span>
          </button>
          <div className="flex items-center gap-2">
            <AndeanDiamond size={18} />
            <span className="font-subtitle text-base font-extrabold text-slate-900 tracking-tight">Cochabamba</span>
          </div>
          <button className="relative rounded-lg p-2 hover:bg-slate-100 transition text-slate-700 cursor-pointer" aria-label="Favoritos">
            <Icon name="heart" size={20} filled={favorites.length > 0} />
            {favorites.length > 0 && (
              <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-md bg-rose-700 text-[9px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main>
        {/* Hero Banner */}
        <section className="relative min-h-[440px] overflow-hidden text-white bg-slate-950">
          <img
            src={data.hero}
            alt={data.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              category === "gastronomia" && showAlternateHero ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          />
          {category === "gastronomia" && (
            <div className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${showAlternateHero ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <img src={saltenaImage} alt="Tigrillo disfrutando Salteña Boliviana" className="h-full w-full object-cover object-right md:object-center" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent" />
          <div className="relative mx-auto flex min-h-[440px] max-w-[1240px] items-center px-4 py-14 lg:px-8">
            <div className="max-w-[660px]">
              <div className="mb-3.5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/30 px-3 py-1 backdrop-blur-md">
                <AndeanDiamond size={14} />
                <p className="font-subtitle text-xs font-bold uppercase tracking-widest text-amber-300">{data.eyebrow}</p>
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-tight">{data.title}</h1>
              <p className="mt-3.5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-200">{data.intro}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {data.stats.map((stat) => (
                  <span key={stat} className="rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-subtitle font-semibold backdrop-blur-md">
                    {stat}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {category === "gastronomia" && (
            <div className="absolute bottom-4 right-6 z-20 hidden sm:flex items-center gap-2 rounded-md border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
              <span className={`h-2 w-2 rounded-full transition-all ${!showAlternateHero ? "bg-amber-400 scale-125" : "bg-white/40"}`} />
              <span className={`h-2 w-2 rounded-full transition-all ${showAlternateHero ? "bg-amber-400 scale-125" : "bg-white/40"}`} />
              <span className="font-subtitle text-xs font-bold text-white/90">
                {showAlternateHero ? "🐾 Tigrillo con Salteña Boliviana" : "Sabores de la Llajta"}
              </span>
            </div>
          )}
        </section>

        {/* Experience Cards with ZoomImage & Guide Popup */}
        <section className="mx-auto max-w-[1240px] px-4 py-14 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">—— SELECCIÓN LOCAL</p>
              <h2 className="section-title">Experiencias imperdibles</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Pasa el cursor sobre cualquier imagen para hacer <strong>zoom dinámico</strong> o haz clic para ver en pantalla completa.
              </p>
            </div>
            <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1">
              {data.filters.map((filter, index) => (
                <button
                  key={filter}
                  type="button"
                  className="rounded-lg border px-3.5 py-1.5 font-subtitle text-xs font-bold transition shadow-2xs cursor-pointer"
                  style={index === 0 ? { backgroundColor: "#0F172A", borderColor: "#0F172A", color: "white" } : { backgroundColor: "white", borderColor: "#E2E8F0", color: "#334155" }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.highlights.map((item, index) => {
              const favorite = favorites.includes(item.title);
              return (
                <article key={item.title} className="group overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <ZoomImage
                      src={item.image}
                      alt={item.title}
                      containerClassName="relative h-full w-full overflow-hidden group cursor-crosshair"
                      onZoomClick={() =>
                        onZoomClick({
                          src: item.image,
                          title: item.title,
                          area: item.place,
                          tag: item.label,
                          category,
                        })
                      }
                    />

                    {/* Quick Zoom Lens Button */}
                    <button
                      type="button"
                      onClick={() =>
                        onZoomClick({
                          src: item.image,
                          title: item.title,
                          area: item.place,
                          tag: item.label,
                          category,
                        })
                      }
                      className="absolute left-3 bottom-3 z-20 flex items-center gap-1.5 rounded-md bg-slate-900/85 hover:bg-rose-700 text-white px-2.5 py-1 text-[11px] font-subtitle font-bold backdrop-blur-md shadow-sm border border-white/20 transition cursor-pointer"
                      title="Ver foto en alta resolución con lupa de zoom"
                    >
                      <span>🔍</span>
                      <span>Zoom</span>
                    </button>

                    <span className="absolute left-3 top-3 rounded-md px-2.5 py-0.5 font-subtitle text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm pointer-events-none" style={{ backgroundColor: data.accent }}>
                      {item.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.title)}
                      className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg transition shadow-sm z-10 cursor-pointer border ${favorite ? "bg-rose-700 text-white border-rose-700" : "bg-white/95 text-slate-700 hover:bg-white border-white/60"}`}
                      aria-label={`Guardar ${item.title}`}
                    >
                      <Icon name="heart" size={16} filled={favorite} />
                    </button>

                    <span className="absolute bottom-1 left-3 font-display text-[52px] leading-none font-bold text-white/20 select-none pointer-events-none">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Icon name="pin" size={13} /> {item.place}
                      </div>
                      <h3
                        onClick={() => onOpenDetail(item.title)}
                        className="font-subtitle text-lg font-bold text-slate-900 hover:text-rose-700 transition cursor-pointer leading-snug"
                        title="Ver detalles"
                      >
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(item.title)}
                        className="font-subtitle font-bold text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer text-xs"
                      >
                        <span>Detalles</span>
                        <span>→</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onBookExperience(item.title)}
                        className="rounded-lg bg-slate-900 text-white px-3 py-1.5 font-subtitle font-bold hover:bg-slate-800 transition shadow-2xs cursor-pointer text-xs"
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-400">
        <div className="aguayo-strip h-1" />
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-6 text-xs">
          <div className="flex items-center gap-2">
            <AndeanDiamond size={15} />
            <span className="font-subtitle font-bold text-white">Cochabamba</span>
            <span className="text-slate-500">· Riqsi Rutas</span>
          </div>
          <span className="font-script text-2xl text-[#F4C430]">"Cochabamba, siempre una buena idea"</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Main Application ─────────────────────────────────────────────────────────
function MainApp() {
  const { currentUser, isEffectiveAdmin, logout } = useAuth();

  // Navigation State
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [showFlaskDemo, setShowFlaskDemo] = useState(false);

  // Data State
  const [places, setPlaces] = useState<PlaceItem[]>(INITIAL_PLACES);
  const [announcement, setAnnouncement] = useState<Announcement>(INITIAL_ANNOUNCEMENT);

  // Filter / Search State
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [travelers, setTravelers] = useState("2 personas");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(2026, 9, 15),
    endDate: new Date(2026, 9, 18),
    label: "15 — 18 de octubre",
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isAdminPortalModalOpen, setIsAdminPortalModalOpen] = useState(false);
  const [isAdminPlaceModalOpen, setIsAdminPlaceModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceItem | null>(null);
  const [isAdminUsersModalOpen, setIsAdminUsersModalOpen] = useState(false);
  const [isAdminAnnouncementModalOpen, setIsAdminAnnouncementModalOpen] = useState(false);

  // Zoom Modal State
  const [zoomModalData, setZoomModalData] = useState<ZoomModalData | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Place Detail Guide Modal State (Qué ver aquí)
  const [selectedDetailPlace, setSelectedDetailPlace] = useState<PlaceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetPlace, setPaymentTargetPlace] = useState<PlaceItem | null>(null);

  // Map View State (Geolocalización & Rutas en vivo)
  const [showMap, setShowMap] = useState(false);
  const [mapInitialPlace, setMapInitialPlace] = useState<PlaceItem | null>(null);

  // Load persisted data
  useEffect(() => {
    getLocalPlaces().then((stored) => { if (stored?.length) setPlaces(stored); });
    getLocalAnnouncement().then((stored) => { if (stored) setAnnouncement(stored); });
  }, []);

  // Subscribe to Supabase real-time
  useEffect(() => {
    const unsubPlaces = subscribeToPlaces((cloudPlaces) => {
      if (cloudPlaces?.length) setPlaces(cloudPlaces);
    });
    const unsubAnn = subscribeToAnnouncement((cloudAnn) => {
      if (cloudAnn) setAnnouncement(cloudAnn);
    });
    return () => { unsubPlaces(); unsubAnn(); };
  }, []);

  // Admin portal & Map hash / keyboard shortcut
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#portal-admin" || window.location.hash === "#admin") {
        setIsAdminPortalModalOpen(true);
      } else if (window.location.hash === "#mapa" || window.location.hash === "#map") {
        setShowMap(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsAdminPortalModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const notify = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 4500);
  };

  const toggleFavorite = (title: string) => {
    setFavorites((items) =>
      items.includes(title) ? items.filter((i) => i !== title) : [...items, title]
    );
  };

  const handleSearch = () => {
    const activityText = searchQuery ? ` "${searchQuery}"` : "";
    notify(`Buscando experiencias${activityText} para ${travelers} entre el ${dateRange.label}.`);
    const elem = document.getElementById("destacados");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectSearchOption = (option: SearchOption) => {
    setSearchQuery(option.title);
    if (option.category && ["naturaleza", "gastronomia", "cultura", "aventura"].includes(option.category)) {
      setSelectedFilter(option.category);
    } else {
      setSelectedFilter("todos");
    }
    notify(`Mostrando: ${option.title}`);
    const elem = document.getElementById("destacados");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Place CRUD ────────────────────────────────────────────────────────────
  const handleSavePlace = async (placeToSave: PlaceItem) => {
    await savePlace(placeToSave);
    setPlaces((prev) => {
      const exists = prev.some((p) => p.id === placeToSave.id);
      return exists ? prev.map((p) => (p.id === placeToSave.id ? placeToSave : p)) : [placeToSave, ...prev];
    });
     notify(
    editingPlace
      ? `¡Los cambios de "${placeToSave.title}" se guardaron correctamente!`
      : `¡El destino "${placeToSave.title}" se guardó correctamente!`
  );
  setEditingPlace(null);
};

  const handleDeletePlace = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de eliminar el destino "${title}"?`)) {
      await deletePlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
      notify(`Destino "${title}" eliminado.`);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const target = places.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, featured: !target.featured };
    await savePlace(updated);
    setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)));
    notify(updated.featured ? `"${target.title}" marcado como Destacado ⭐` : `"${target.title}" retirado de destacados.`);
  };

  const openNewPlaceModal = () => { setEditingPlace(null); setIsAdminPlaceModalOpen(true); };
  const openEditPlaceModal = (place: PlaceItem) => { setEditingPlace(place); setIsAdminPlaceModalOpen(true); };

  // ─── Filtered places (considers searchQuery + selectedFilter with accent-insensitivity) ───
  const filteredPlaces = useMemo(() => {
    const q = cleanText(searchQuery);

    return places.filter((p) => {
      const matchesFilter =
        selectedFilter === "todos" ||
        (selectedFilter === "destacados" && !!p.featured) ||
        p.category === selectedFilter;

      if (!matchesFilter) return false;
      if (!q) return true;

      const titleNorm = cleanText(p.title);
      const areaNorm = cleanText(p.area);
      const tagNorm = cleanText(p.tag);
      const catNorm = cleanText(p.category);

      // Sinónimos ampliados
      if (q === "comer" || q === "comida") {
        return catNorm.includes("gastro") || titleNorm.includes("silpancho") || titleNorm.includes("cancha") || titleNorm.includes("pique");
      }
      if (q === "ver" || q === "visitar") {
        return catNorm.includes("cultura") || titleNorm.includes("cristo") || titleNorm.includes("portales") || titleNorm.includes("tunari");
      }

      return (
        titleNorm.includes(q) ||
        areaNorm.includes(q) ||
        tagNorm.includes(q) ||
        catNorm.includes(q)
      );
    });
  }, [places, selectedFilter, searchQuery]);

  // ─── Zoom helpers ──────────────────────────────────────────────────────────
  const openZoomModal = (place: PlaceItem) => {
    setZoomModalData({
      src: place.image,
      title: place.title,
      area: place.area,
      tag: place.tag,
      category: place.category,
    });
    setIsZoomModalOpen(true);
  };

  // ─── Place Detail Guide helper ─────────────────────────────────────────────
  const openPlaceDetailModal = (place: PlaceItem) => {
    setSelectedDetailPlace(place);
    setIsDetailModalOpen(true);
  };

  const openPlaceDetailByTitle = (title: string) => {
    const match = places.find((p) => p.title.toLowerCase().includes(title.toLowerCase()));
    if (match) {
      setSelectedDetailPlace(match);
      setIsDetailModalOpen(true);
    } else {
      notify(`Información detallada para: ${title}`);
    }
  };

  // ─── Payment helpers (Booking Style) ───────────────────────────────────────
  const openPaymentModal = (place?: PlaceItem) => {
    setPaymentTargetPlace(place || places[0] || null);
    setIsPaymentModalOpen(true);
  };

  // ─── Flask demo sub-page ───────────────────────────────────────────────────
  if (showFlaskDemo) {
    return (
      <div>
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(15,52,96,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.1)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => { setShowFlaskDemo(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "6px 14px", color: "#e2e8f0", fontSize: ".85rem", cursor: "pointer" }}
          >
            <span style={{ transform: "rotate(180deg)", display: "inline-block" }}>→</span> Volver a Riqsi Rutas
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🐍</span>
            <span style={{ color: "#4ade80", fontWeight: 700, fontSize: ".9rem" }}>Flask CRUD Demo</span>
            <span style={{ color: "#64748b", fontSize: ".75rem" }}>· Python · En memoria · Supabase Bridge</span>
          </div>
          <div style={{ width: 120 }} />
        </div>
        <div style={{ paddingTop: 60 }}>
          <FlaskCrudDemo />
        </div>
      </div>
    );
  }

  // ─── Map View sub-page (Geolocalización & Rutas en vivo) ───────────────────
  if (showMap) {
    return (
      <MapView
        places={places}
        initialPlace={mapInitialPlace}
        onBack={() => {
          setShowMap(false);
          setMapInitialPlace(null);
          window.location.hash = "";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  // ─── Category sub-page with ZoomImage support ──────────────────────────────
  if (activeCategory) {
    return (
      <CategoryPage
        category={activeCategory}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onZoomClick={(data) => {
          setZoomModalData(data);
          setIsZoomModalOpen(true);
        }}
        onOpenDetail={openPlaceDetailByTitle}
        onBookExperience={(title) => {
          const match = places.find((p) => p.title.toLowerCase().includes(title.toLowerCase()));
          openPaymentModal(match || places[0]);
        }}
        onBack={() => { setActiveCategory(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      />
    );
  }

  // ─── Main Page ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-700 selection:text-white">
      {/* Navbar (includes announcement banner + sticky header) */}
      <Navbar
        currentUser={currentUser}
        announcement={announcement}
        favoritesCount={favorites.length}
        dateRangeLabel={dateRange.label}
        isEffectiveAdmin={isEffectiveAdmin}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenFavorites={() =>
          notify(
            favorites.length > 0
              ? `Tienes ${favorites.length} lugar(es) guardado(s) en favoritos.`
              : "Aún no tienes favoritos. ¡Haz clic en el corazón de cualquier experiencia!"
          )
        }
        onOpenAuthModal={(tab) => { setAuthModalTab(tab); setIsAuthModalOpen(true); }}
        onLogout={() => { logout(); notify("Sesión cerrada correctamente."); }}
        onOpenFlaskDemo={() => { setShowFlaskDemo(true); window.scrollTo({ top: 0 }); }}
        onOpenEditAnnouncement={() => setIsAdminAnnouncementModalOpen(true)}
        onOpenPayReservation={() => openPaymentModal()}
        onOpenMap={() => { setMapInitialPlace(null); setShowMap(true); }}
      />

      <main>
        {/* Hero Section with smart search bar */}
        <HeroSection
          places={places}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectSearchOption={handleSelectSearchOption}
          onSearchSubmit={handleSearch}
          dateRangeLabel={dateRange.label}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          travelers={travelers}
          onTravelersChange={setTravelers}
          currentUser={currentUser}
          onOpenAuthModal={(tab) => { setAuthModalTab(tab); setIsAuthModalOpen(true); }}
          onOpenMap={() => { setMapInitialPlace(null); setShowMap(true); }}
        />

        {/* Quick Category Cards */}
        <QuickCategorySection onSelectCategory={setActiveCategory} />

        {/* Featured Destinations with Cursor Magnifier Zoom + Place Detail Guide */}
        <PlacesSection
          places={places}
          filteredPlaces={filteredPlaces}
          favorites={favorites}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          isEffectiveAdmin={isEffectiveAdmin}
          onToggleFavorite={toggleFavorite}
          onZoomClick={openZoomModal}
          onBookClick={(place) => openPaymentModal(place)}
          onDetailsClick={openPlaceDetailModal}
          onOpenNewPlaceModal={openNewPlaceModal}
          onToggleFeatured={handleToggleFeatured}
          onEditPlace={openEditPlaceModal}
          onDeletePlace={handleDeletePlace}
          onOpenMap={(place) => {
            setMapInitialPlace(place);
            setShowMap(true);
            window.location.hash = "#mapa";
          }}
        />

        {/* Cultural Quote Card */}
        <section className="mx-auto max-w-[1240px] px-4 pb-14 lg:px-8">
          <div className="rounded-xl bg-white p-8 sm:p-12 text-center border border-slate-200/90 shadow-xs relative overflow-hidden">
            <div className="flex justify-center text-slate-400 mb-2">
              <Icon name="mountain" size={32} className="text-slate-700" />
            </div>
            <p className="font-script text-3xl sm:text-5xl lg:text-6xl text-slate-900 font-normal leading-tight my-3">
              "Cochabamba, siempre una buena idea"
            </p>
            <div className="flex justify-center items-center gap-2 mt-4">
              <span className="h-px w-12 bg-slate-200" />
              <AndeanDiamond size={18} />
              <span className="h-px w-12 bg-slate-200" />
            </div>
          </div>
        </section>

        {/* Trip Planner Section with Dijkstra */}
        <TripPlannerSection
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onBookExperience={() => openPaymentModal()}
        />

        {/* Purpose Banner */}
        <section className="bg-slate-900 text-white">
          <div className="aguayo-strip h-1" />
          <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center lg:px-8">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-subtitle text-xs font-bold uppercase tracking-widest text-amber-300">Viaja con propósito</p>
                <span className="font-script text-2xl text-white">¡Bienvenidos!</span>
              </div>
              <h2 className="font-display mt-1 text-2xl sm:text-3xl font-bold">
                Descubre más. Apoya a los productores y artesanos locales.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => notify("¡Gracias por apoyar el turismo comunitario en Cochabamba!")}
              className="shrink-0 rounded-lg bg-white px-6 py-3 font-subtitle text-xs sm:text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100 cursor-pointer"
            >
              Conoce nuestra comunidad →
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* ── Floating Admin Dock ── */}
      <AdminBar
        places={places}
        onOpenNewPlace={openNewPlaceModal}
        onOpenUsers={() => setIsAdminUsersModalOpen(true)}
        onOpenAnnouncement={() => setIsAdminAnnouncementModalOpen(true)}
        onOpenSecurityPortal={() => setIsAdminPortalModalOpen(true)}
      />

      {/* ── Auth Modal ── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onNotify={notify}
      />

      {/* ── Admin Portal Modal ── */}
      <AdminPortalModal
        isOpen={isAdminPortalModalOpen}
        onClose={() => setIsAdminPortalModalOpen(false)}
        onNotify={notify}
      />

      {/* ── Admin Place Modal ── */}
      <AdminPlaceModal
        isOpen={isAdminPlaceModalOpen}
        editingPlace={editingPlace}
        onSave={handleSavePlace}
        onClose={() => { setIsAdminPlaceModalOpen(false); setEditingPlace(null); }}
      />

      {/* ── Admin Users Modal ── */}
      <AdminUsersModal
        isOpen={isAdminUsersModalOpen}
        onClose={() => setIsAdminUsersModalOpen(false)}
        onNotify={notify}
      />

      {/* ── Admin Announcement Modal ── */}
      <AdminAnnouncementModal
        isOpen={isAdminAnnouncementModalOpen}
        announcement={announcement}
        onSave={async (updatedAnn) => {
          await saveAnnouncement(updatedAnn);
          setAnnouncement(updatedAnn);
          notify("Comunicado oficial actualizado.");
        }}
        onClose={() => setIsAdminAnnouncementModalOpen(false)}
      />

      {/* ── Interactive Calendar Modal ── */}
      <CalendarPicker
        isOpen={isCalendarOpen}
        value={dateRange}
        onChange={(newRange) => setDateRange(newRange)}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* ── Image Zoom Viewer Modal (Works for places, food, and categories) ── */}
      <ImageZoomModal
        isOpen={isZoomModalOpen}
        data={zoomModalData}
        onClose={() => setIsZoomModalOpen(false)}
      />

      {/* ── Creative Place Detail Guide Modal (Qué ver aquí) ── */}
      <PlaceDetailModal
        isOpen={isDetailModalOpen}
        place={selectedDetailPlace}
        isFavorite={selectedDetailPlace ? favorites.includes(selectedDetailPlace.title) : false}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailPlace(null);
        }}
        onToggleFavorite={toggleFavorite}
        onOpenZoomModal={openZoomModal}
        onOpenBookingPayment={(place) => openPaymentModal(place)}
      />

      {/* ── Payment & Reservation Modal (Booking Style) ── */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        place={paymentTargetPlace}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={(booking) => {
          notify(`✅ Reserva ${booking.bookingCode} confirmada para ${booking.placeTitle}`);
        }}
      />

      {/* ── Toast Notification ── */}
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

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
