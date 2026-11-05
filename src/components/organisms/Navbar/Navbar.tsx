import React, { useState } from "react";
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

  return (
    <>
      {/* Top Precision Aguayo line */}
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
          <a href="#" className="flex items-center gap-3 group" aria-label="Cochabamba Turismo">
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

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 font-subtitle text-xs sm:text-sm font-bold text-slate-700 md:flex">
            <a className="hover:text-rose-700 transition" href="#inicio">Inicio</a>
            <a className="hover:text-rose-700 transition" href="#explora">Explora</a>
            {onOpenMap && (
              <button
                type="button"
                onClick={onOpenMap}
                className="hover:text-rose-700 transition flex items-center gap-1.5 cursor-pointer font-subtitle text-xs sm:text-sm font-bold text-slate-700"
              >
                <Icon name="map" size={16} />
                <span>Mapa Interactivo</span>
              </button>
            )}
            <a className="hover:text-rose-700 transition" href="#destacados">Destinos</a>
            <a className="hover:text-rose-700 transition" href="#planifica">Rutas Dijkstra</a>
            <button
              type="button"
              onClick={onOpenFlaskDemo}
              className="flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
              title="Ver demo Flask Python CRUD & Dijkstra"
            >
              <span>🐍</span>
              <span>Flask API</span>
            </button>
          </nav>

          {/* Actions & User State */}
          <div className="flex items-center gap-2">
            {onOpenPayReservation && (
              <button
                type="button"
                onClick={onOpenPayReservation}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 font-subtitle text-xs font-bold shadow-xs transition cursor-pointer"
                title="Abrir pasarela de pago para reservas"
              >
                <Icon name="qr" size={13} />
                <span>Pagar Reserva</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCalendar}
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 px-3 py-1.5 font-subtitle text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
              title="Abrir calendario"
            >
              <Icon name="calendar" size={15} />
              <span>{dateRangeLabel}</span>
            </button>

            <button
              type="button"
              onClick={onOpenFavorites}
              className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Ver favoritos"
            >
              <Icon name="heart" size={20} filled={favoritesCount > 0} />
              {favoritesCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-md bg-rose-700 text-[10px] font-bold text-white shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Login / Profile */}
            {!currentUser ? (
              <div className="hidden sm:flex items-center gap-2">
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
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-1.5 font-subtitle text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  Registrarse
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg pl-1.5 pr-2 py-1 shadow-2xs">
                <span className="h-6 w-6 rounded-md bg-white shadow-2xs border border-slate-200 grid place-items-center text-xs">
                  {currentUser.avatar || (currentUser.role === "admin" ? "👑" : "🎒")}
                </span>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-subtitle text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      currentUser.role === "admin" ? "text-rose-700" : "text-sky-700"
                    }`}
                  >
                    {currentUser.role === "admin" ? "Admin" : "Turista"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-1 rounded-md p-1 text-slate-400 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                  title="Cerrar sesión"
                >
                  <span className="text-xs">🚪</span>
                </button>
              </div>
            )}

            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 md:hidden cursor-pointer"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Abrir menú"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenu && (
          <div className="mx-4 mb-4 rounded-xl bg-white p-4 text-sm shadow-xl md:hidden border border-slate-200 space-y-2">
            <a className="block py-2 font-subtitle font-bold text-slate-800 hover:text-rose-700" href="#inicio" onClick={() => setMobileMenu(false)}>Inicio</a>
            <a className="block py-2 font-subtitle font-bold text-slate-800 hover:text-rose-700" href="#explora" onClick={() => setMobileMenu(false)}>Explora</a>
            {onOpenMap && (
              <button
                type="button"
                className="flex items-center gap-2 w-full py-2 font-subtitle font-bold text-slate-800 hover:text-rose-700 text-left cursor-pointer"
                onClick={() => {
                  onOpenMap();
                  setMobileMenu(false);
                }}
              >
                <Icon name="map" size={17} />
                <span>Mapa Interactivo</span>
              </button>
            )}
            <a className="block py-2 font-subtitle font-bold text-slate-800 hover:text-rose-700" href="#destacados" onClick={() => setMobileMenu(false)}>Destinos</a>
            <a className="block py-2 font-subtitle font-bold text-slate-800 hover:text-rose-700" href="#planifica" onClick={() => setMobileMenu(false)}>Rutas Dijkstra</a>

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
                    className="w-full rounded-lg bg-rose-700 py-2 font-subtitle font-bold text-xs text-white"
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-subtitle font-bold text-xs text-white shadow-xs"
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
