import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { PlaceItem } from "../types/auth";

interface AdminBarProps {
  places: PlaceItem[];
  onOpenNewPlace: () => void;
  onOpenUsers: () => void;
  onOpenAnnouncement: () => void;
}

export function AdminBar({
  places,
  onOpenNewPlace,
  onOpenUsers,
  onOpenAnnouncement,
}: AdminBarProps) {
  const { currentUser, previewAsNormal, setPreviewAsNormal, logout, users } = useAuth();
  const [minimized, setMinimized] = useState(false);

  if (!currentUser || currentUser.role !== "admin") return null;

  const totalPlaces = places.length;
  const featuredCount = places.filter((p) => p.featured).length;

  return (
    <aside
      aria-label="Panel de Control Administrador"
      className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] transition-all duration-300"
    >
      <div className="overflow-hidden rounded-2xl bg-[#0F172A]/95 text-white shadow-2xl backdrop-blur-md border-2 border-[#F4C430]/70">
        {/* Aguayo top thin line */}
        <div className="aguayo-strip h-1.5 w-full" />

        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#1E293B]/90 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#F4C430] text-black font-black text-xs">
              👑
            </span>
            <div>
              <span className="font-subtitle text-xs font-black tracking-wider uppercase text-[#F4C430]">
                Panel Administrador
              </span>
              <span className="hidden sm:inline text-xs text-white/70 ml-2">
                · {currentUser.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Preview as Normal Tourist */}
            <button
              onClick={() => setPreviewAsNormal(!previewAsNormal)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-subtitle font-bold transition flex items-center gap-1.5 ${
                previewAsNormal
                  ? "bg-[#D81B60] text-white"
                  : "bg-white/10 text-white/90 hover:bg-white/20"
              }`}
              title="Alternar vista para ver la página como un turista normal sin editar"
            >
              <span>{previewAsNormal ? "👁️ Viendo como Turista" : "✏️ Modo Edición"}</span>
            </button>

            <button
              onClick={() => setMinimized(!minimized)}
              className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 grid place-items-center text-xs text-white/80"
              title={minimized ? "Expandir panel" : "Minimizar panel"}
            >
              {minimized ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {/* Expanded body with quick actions and stats */}
        {!minimized && (
          <div className="p-3.5 space-y-3">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/5 p-2 border border-white/10">
                <p className="text-[10px] text-white/60 font-subtitle uppercase">Rutas</p>
                <p className="text-base font-bold text-[#F4C430]">{totalPlaces}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2 border border-white/10">
                <p className="text-[10px] text-white/60 font-subtitle uppercase">Destacadas</p>
                <p className="text-base font-bold text-[#38BDF8]">{featuredCount}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2 border border-white/10">
                <p className="text-[10px] text-white/60 font-subtitle uppercase">Usuarios</p>
                <p className="text-base font-bold text-[#4ADE80]">{users.length}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onOpenNewPlace}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-xl bg-[#D81B60] px-3 py-2 text-xs font-subtitle font-extrabold text-white shadow-md hover:bg-[#b0144c] transition"
              >
                <span>➕ Agregar Destino</span>
              </button>

              <button
                onClick={onOpenUsers}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-subtitle font-bold text-white transition border border-white/15"
              >
                <span>👥 Usuarios ({users.length})</span>
              </button>

              <button
                onClick={onOpenAnnouncement}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-subtitle font-bold text-white transition border border-white/15"
                title="Editar comunicado oficial en la página"
              >
                <span>📢 Aviso Web</span>
              </button>

              <button
                onClick={logout}
                className="rounded-xl bg-red-950/60 hover:bg-red-900 px-3 py-2 text-xs font-subtitle font-bold text-red-200 transition border border-red-500/30"
                title="Cerrar sesión de administrador"
              >
                <span>🚪 Salir</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
