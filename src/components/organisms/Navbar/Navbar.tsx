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
}) => {
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);

  return (
    <>
      {/* Top Aguayo line */}
      <div className="aguayo-strip h-1.5 w-full fixed top-0 left-0 z-50 shadow-xs" />

      {/* Official Announcement Banner (Manageable by Admin) */}
      {announcement.active && (
        <div className="relative z-40 bg-[#1E293B] text-white pt-2.5 pb-2 px-4 border-b border-[#D81B60]/40">
          <div className="mx-auto max-w-[1240px] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-[#D81B60] px-2.5 py-0.5 font-subtitle text-[10px] font-black uppercase tracking-wider text-white">
                {announcement.badge}
              </span>
              <span className="font-subtitle text-white/90">{announcement.message}</span>
            </div>
            <div className="flex items-center gap-3">
              {announcement.linkText && (
                <a
                  href="#destacados"
                  className="font-subtitle font-bold text-[#F4C430] hover:underline"
                >
                  {announcement.linkText} →
                </a>
              )}
              {isEffectiveAdmin && onOpenEditAnnouncement && (
                <button
                  type="button"
                  onClick={onOpenEditAnnouncement}
                  className="rounded-lg bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-subtitle font-bold text-[#F4C430] border border-[#F4C430]/30 transition"
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-[#E2D9CC]/70">
        <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between px-5 lg:px-8">
          {/* Brand Logo with Tigrillo */}
          <a href="#" className="flex items-center gap-3 group" aria-label="Cochabamba Turismo">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FAF7F2] border border-[#E2D9CC] shadow-xs transition group-hover:scale-105 overflow-hidden p-0.5">
              <img
                src={gatoExploradorImage}
                alt="Gato Explorador - Tigrillo Boliviano"
                className="h-full w-full object-contain"
              />
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
          <nav className="hidden items-center gap-7 font-subtitle text-sm font-bold text-[#37474F] md:flex">
            <a className="hover:text-[#D81B60] transition" href="#inicio">Inicio</a>
            <a className="hover:text-[#D81B60] transition" href="#explora">Explora</a>
            <a className="hover:text-[#D81B60] transition" href="#destacados">Destinos</a>
            <a className="hover:text-[#D81B60] transition" href="#planifica">Rutas Dijkstra</a>
            <button
              type="button"
              onClick={onOpenFlaskDemo}
              className="flex items-center gap-1.5 rounded-full border border-[#4ade80]/40 bg-[#4ade80]/10 px-3 py-1 text-xs font-bold text-[#166534] hover:bg-[#4ade80]/20 transition"
              title="Ver demo Flask Python CRUD & Dijkstra"
            >
              🐍 Flask Backend
            </button>
          </nav>

          {/* Actions & User State */}
          <div className="flex items-center gap-2.5">
            {/* Quick Checkout CTA */}
            {onOpenPayReservation && (
              <button
                type="button"
                onClick={onOpenPayReservation}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-3.5 py-1.5 font-subtitle text-xs font-black shadow-xs transition"
                title="Abrir pasarela de pago para reservas"
              >
                <Icon name="qr" size={14} />
                <span>Pagar Reserva</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCalendar}
              className="hidden lg:flex items-center gap-2 rounded-full border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-1.5 font-subtitle text-xs font-bold text-[#37474F] hover:border-[#D81B60] hover:text-[#D81B60] transition shadow-xs"
              title="Abrir calendario"
            >
              <Icon name="calendar" size={16} />
              <span>{dateRangeLabel}</span>
            </button>

            <button
              type="button"
              onClick={onOpenFavorites}
              className="relative rounded-full p-2 text-[#37474F] hover:bg-[#FAF7F2] transition"
              aria-label="Ver favoritos"
            >
              <Icon name="heart" size={22} filled={favoritesCount > 0} />
              {favoritesCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[#D81B60] text-[10px] font-bold text-white shadow-xs">
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
                  className="rounded-full border border-[#E2D9CC] bg-white px-3.5 py-1.5 font-subtitle text-xs font-bold text-[#37474F] hover:border-[#D81B60] hover:text-[#D81B60] transition shadow-2xs"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal("register")}
                  className="rounded-full bg-[#D81B60] px-3.5 py-1.5 font-subtitle text-xs font-extrabold text-white shadow-md shadow-[#D81B60]/20 hover:bg-[#b0144c] transition"
                >
                  Crear Cuenta
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-full pl-1.5 pr-2 py-1 shadow-2xs">
                <span className="h-7 w-7 rounded-full bg-white shadow-2xs border border-[#E2D9CC] grid place-items-center text-sm">
                  {currentUser.avatar || (currentUser.role === "admin" ? "👑" : "🎒")}
                </span>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-subtitle text-xs font-bold text-[#37474F] leading-tight truncate max-w-[100px]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      currentUser.role === "admin" ? "text-[#D81B60]" : "text-[#0097A7]"
                    }`}
                  >
                    {currentUser.role === "admin" ? "Admin" : "Turista"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-1 rounded-full p-1 text-[#6D4C41] hover:text-red-600 hover:bg-white transition"
                  title="Cerrar sesión"
                >
                  <span className="text-xs">🚪</span>
                </button>
              </div>
            )}

            <button
              type="button"
              className="rounded-full border border-[#E2D9CC] p-2 text-[#37474F] md:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Abrir menú"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenu && (
          <div className="mx-4 mb-4 rounded-2xl bg-white p-5 text-sm shadow-xl md:hidden border border-[#E2D9CC] space-y-3">
            <a className="block py-2 font-subtitle font-bold text-[#37474F]" href="#inicio" onClick={() => setMobileMenu(false)}>Inicio</a>
            <a className="block py-2 font-subtitle font-bold text-[#37474F]" href="#explora" onClick={() => setMobileMenu(false)}>Explora</a>
            <a className="block py-2 font-subtitle font-bold text-[#37474F]" href="#destacados" onClick={() => setMobileMenu(false)}>Destinos</a>
            <a className="block py-2 font-subtitle font-bold text-[#37474F]" href="#planifica" onClick={() => setMobileMenu(false)}>Rutas Dijkstra</a>

            <div className="pt-2 border-t border-[#E8E3D8]">
              {!currentUser ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal("login");
                      setMobileMenu(false);
                    }}
                    className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] py-2 font-subtitle font-bold text-xs text-[#37474F]"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal("register");
                      setMobileMenu(false);
                    }}
                    className="w-full rounded-xl bg-[#D81B60] py-2 font-subtitle font-bold text-xs text-white"
                  >
                    Crear Cuenta
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#FAF7F2] p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>{currentUser.avatar}</span>
                    <div>
                      <p className="font-subtitle text-xs font-bold text-[#37474F]">{currentUser.name}</p>
                      <p className="text-[10px] text-[#6D4C41]">Rol: {currentUser.role === "admin" ? "Administrador" : "Turista Normal"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenu(false);
                    }}
                    className="text-xs text-red-600 font-bold"
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#D81B60] px-5 py-2.5 font-subtitle font-bold text-white shadow-sm"
            >
              <Icon name="calendar" size={17} /> Elegir fechas de viaje
            </button>
          </div>
        )}
      </header>
    </>
  );
};
