import React, { useState, useRef, useEffect } from "react";
import { Icon } from "../../atoms/Icon/Icon";
import gatoExploradorImage from "../../../assets/gato-explorador.png";
import type { User, Announcement } from "../../../types/auth";

interface NavbarProps {
  currentUser: User | null;
  announcement: Announcement;
  favoritesCount: number;
  dateRangeLabel: string;
  isEffectiveAdmin: boolean;
  onOpenCalendar: () => void;
  onOpenFavorites: () => void;
  onOpenAuthModal: (tab: "login" | "register") => void;
  onLogout: () => void;
  onOpenFlaskDemo: () => void;
  onOpenEditAnnouncement?: () => void;
  onOpenPayReservation?: () => void;
  onOpenMap?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  announcement,
  favoritesCount,
  dateRangeLabel,
  isEffectiveAdmin,
  onOpenCalendar,
  onOpenFavorites,
  onOpenAuthModal,
  onLogout,
  onOpenFlaskDemo,
  onOpenEditAnnouncement,
  onOpenPayReservation,
  onOpenMap,
}) => {
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Precision Aguayo line */}
      <div className="aguayo-strip h-1 w-full fixed top-0 left-0 z-50 shadow-xs" />

      {/* Official Announcement Banner */}
      {announcement.active && (
        <div className="relative z-40 bg-slate-900 text-white pt-2 pb-2 px-4 border-b border-slate-800">
          <div className="mx-auto max-w-[1240px] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="rounded-md bg-rose-700 px-2 py-0.5 font-subtitle text-[10px] font-extrabold uppercase tracking-wider text-white">
                {announcement.badge}
              </span>
              <span className="font-subtitle text-slate-200">{announcement.message}</span>
            </div>
            <div className="flex items-center gap-3">
              {announcement.linkText && (
                <a
                  href="#destacados"
                  className="font-subtitle font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  {announcement.linkText} →
                </a>
              )}
              {isEffectiveAdmin && onOpenEditAnnouncement && (
                <button
                  type="button"
                  onClick={onOpenEditAnnouncement}
                  className="rounded-md bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-subtitle font-bold text-amber-300 border border-amber-400/30 transition cursor-pointer"
                  title="Editar este comunicado oficial"
                >
                  ✏️ Editar aviso
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 lg:px-8">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group shrink-0" aria-label="Cochabamba Turismo">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-50 border border-slate-200 shadow-2xs transition group-hover:scale-105 overflow-hidden p-0.5">
              <img
                src={gatoExploradorImage}
                alt="Gato Explorador - Tigrillo Boliviano"
                className="h-full w-full object-contain"
              />
            </span>
            <div className="flex flex-col">
              <span className="font-subtitle text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Cochabamba
              </span>
              <span className="font-subtitle text-[10px] font-bold tracking-[0.18em] text-rose-700">
                RIQSI RUTAS
              </span>
            </div>
          </a>

          {/* Central Clean Navigation with Plegable / Dropdown Menu */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 font-subtitle text-xs sm:text-sm font-bold text-slate-700">
            <a
              href="#inicio"
              className="px-3 py-2 rounded-lg hover:text-rose-700 hover:bg-slate-50 transition"
            >
              Inicio
            </a>

            <a
              href="#destacados"
              className="px-3 py-2 rounded-lg hover:text-rose-700 hover:bg-slate-50 transition"
            >
              Destinos
            </a>

            {/* Menú Plegable "Explorar y Herramientas" */}
            <div ref={exploreRef} className="relative">
              <button
                type="button"
                onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition cursor-pointer ${
                  exploreDropdownOpen
                    ? "bg-slate-100 text-rose-700 shadow-2xs"
                    : "text-slate-700 hover:text-rose-700 hover:bg-slate-50"
                }`}
                aria-expanded={exploreDropdownOpen}
              >
                <span>Explorar</span>
                <span
                  className={`text-[9px] transition-transform duration-200 ${
                    exploreDropdownOpen ? "rotate-180 text-rose-700" : "text-slate-400"
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Flyout Dropdown Menu */}
              {exploreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {onOpenMap && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenMap();
                        setExploreDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Icon name="map" size={17} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-subtitle text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                            Mapa GPS en Vivo
                          </p>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-200">
                            En vivo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          Rutas vehiculares y a pie en tiempo real
                        </p>
                      </div>
                    </button>
                  )}

                  <a
                    href="#planifica"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition">
                      <Icon name="route" size={17} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-subtitle text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                        Rutas Óptimas Dijkstra
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        Calculadora con grafos y tiempos
                      </p>
                    </div>
                  </a>

                  <a
                    href="#explora"
                    onClick={() => setExploreDropdownOpen(false)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Icon name="compass" size={17} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-subtitle text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        Categorías Temáticas
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        Naturaleza, cultura, comida y aventura
                      </p>
                    </div>
                  </a>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      onOpenFlaskDemo();
                      setExploreDropdownOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-700 border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition">
                      <span>🐍</span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-subtitle text-xs font-bold text-slate-900 group-hover:text-purple-700 transition">
                          Flask Backend API
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-sm border border-purple-200">
                          Python
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        CRUD completo y endpoints REST
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Utilities (Compact, spaced, aesthetic) */}
          <div className="flex items-center gap-2">
            {/* Quick Checkout CTA */}
            {onOpenPayReservation && (
              <button
                type="button"
                onClick={onOpenPayReservation}
                className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 font-subtitle text-xs font-bold shadow-2xs transition cursor-pointer"
                title="Abrir pasarela de pago para reservas"
              >
                <Icon name="qr" size={13} />
                <span>Pagar Reserva</span>
              </button>
            )}

            {/* Date Selector Pill */}
            <button
              type="button"
              onClick={onOpenCalendar}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 px-3 py-1.5 font-subtitle text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
              title="Abrir calendario interactivo"
            >
              <Icon name="calendar" size={15} />
              <span>{dateRangeLabel}</span>
            </button>

            {/* Favorites Icon */}
            <button
              type="button"
              onClick={onOpenFavorites}
              className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Ver favoritos"
            >
              <Icon name="heart" size={19} filled={favoritesCount > 0} />
              {favoritesCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-md bg-rose-700 text-[10px] font-bold text-white shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Login Actions */}
            {!currentUser ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal("login")}
                  className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 font-subtitle text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal("register")}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 font-subtitle text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  Registrarse
                </button>
              </div>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg pl-1.5 pr-2.5 py-1 shadow-2xs transition cursor-pointer"
                >
                  <span className="h-6 w-6 rounded-md bg-white shadow-2xs border border-slate-200 grid place-items-center text-xs">
                    {currentUser.avatar || (currentUser.role === "admin" ? "👑" : "🎒")}
                  </span>
                  <span className="hidden sm:inline font-subtitle text-xs font-bold text-slate-800 max-w-[90px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-slate-400">▼</span>
                </button>

                {/* User Profile Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white p-2.5 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <p className="font-subtitle text-xs font-bold text-slate-900 truncate">
                        {currentUser.name}
                      </p>
                      <span
                        className={`inline-block mt-0.5 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${
                          currentUser.role === "admin"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-sky-50 text-sky-700 border border-sky-200"
                        }`}
                      >
                        {currentUser.role === "admin" ? "Administrador" : "Turista"}
                      </span>
                    </div>

                    {isEffectiveAdmin && onOpenEditAnnouncement && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenEditAnnouncement();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-subtitle font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer text-left"
                      >
                        <span>✏️</span>
                        <span>Editar Aviso Oficial</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-subtitle font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                    >
                      <span>🚪</span>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 md:hidden cursor-pointer"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Abrir menú de opciones"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>

        {/* Mobile menu collapsible drawer */}
        {mobileMenu && (
          <div className="mx-4 mb-4 rounded-xl bg-white p-4 text-sm shadow-xl md:hidden border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <a
                className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 font-subtitle font-bold text-slate-800 hover:text-rose-700 text-xs"
                href="#inicio"
                onClick={() => setMobileMenu(false)}
              >
                <span>🏠</span>
                <span>Inicio</span>
              </a>
              <a
                className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 font-subtitle font-bold text-slate-800 hover:text-rose-700 text-xs"
                href="#destacados"
                onClick={() => setMobileMenu(false)}
              >
                <span>📍</span>
                <span>Destinos</span>
              </a>
            </div>

            {/* Plegable features for mobile */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Herramientas y Navegación
              </p>
              {onOpenMap && (
                <button
                  type="button"
                  className="flex items-center justify-between w-full py-2 px-3 rounded-lg font-subtitle font-bold text-slate-800 hover:bg-slate-50 text-left cursor-pointer text-xs"
                  onClick={() => {
                    onOpenMap();
                    setMobileMenu(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="map" size={16} />
                    <span>Mapa GPS Interactivo</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-200">
                    En vivo
                  </span>
                </button>
              )}

              <a
                className="flex items-center gap-2 w-full py-2 px-3 rounded-lg font-subtitle font-bold text-slate-800 hover:bg-slate-50 text-left cursor-pointer text-xs"
                href="#planifica"
                onClick={() => setMobileMenu(false)}
              >
                <Icon name="route" size={16} />
                <span>Rutas Dijkstra</span>
              </a>

              <a
                className="flex items-center gap-2 w-full py-2 px-3 rounded-lg font-subtitle font-bold text-slate-800 hover:bg-slate-50 text-left cursor-pointer text-xs"
                href="#explora"
                onClick={() => setMobileMenu(false)}
              >
                <Icon name="compass" size={16} />
                <span>Categorías Turísticas</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onOpenFlaskDemo();
                  setMobileMenu(false);
                }}
                className="flex items-center justify-between w-full py-2 px-3 rounded-lg font-subtitle font-bold text-slate-800 hover:bg-slate-50 text-left cursor-pointer text-xs"
              >
                <span className="flex items-center gap-2">
                  <span>🐍</span>
                  <span>Flask Backend API</span>
                </span>
                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-sm border border-purple-200">
                  Python
                </span>
              </button>

              {onOpenPayReservation && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPayReservation();
                    setMobileMenu(false);
                  }}
                  className="flex items-center gap-2 w-full py-2 px-3 rounded-lg font-subtitle font-bold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-50 text-left cursor-pointer text-xs border border-emerald-200/60 mt-1"
                >
                  <Icon name="qr" size={15} />
                  <span>Pagar Reserva de Viaje</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              {!currentUser ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal("login");
                      setMobileMenu(false);
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 font-subtitle font-bold text-xs text-slate-700"
                  >
                    Ingresar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal("register");
                      setMobileMenu(false);
                    }}
                    className="w-full rounded-lg bg-slate-900 py-2 font-subtitle font-bold text-xs text-white"
                  >
                    Registrarse
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span>{currentUser.avatar}</span>
                    <div>
                      <p className="font-subtitle text-xs font-bold text-slate-800">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500">Rol: {currentUser.role === "admin" ? "Administrador" : "Turista"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenu(false);
                    }}
                    className="text-xs text-rose-600 font-bold"
                  >
                    Salir
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenCalendar();
                setMobileMenu(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 py-2.5 font-subtitle font-bold text-xs text-white shadow-xs"
            >
              <Icon name="calendar" size={15} />
              <span>Elegir fechas de viaje</span>
            </button>
          </div>
        )}
      </header>
    </>
  );
};
