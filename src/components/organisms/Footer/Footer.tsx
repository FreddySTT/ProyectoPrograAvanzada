import React from "react";
import { Icon } from "../../atoms/Icon/Icon";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="aguayo-strip h-1" />
      <div className="mx-auto max-w-[1240px] px-4 py-10 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-amber-400 border border-slate-800">
              <Icon name="mountain" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-subtitle text-lg font-bold text-white tracking-tight">Cochabamba</span>
              <span className="font-subtitle text-[10px] tracking-widest text-slate-400">BOLIVIA · RIQSI RUTAS</span>
            </div>
          </div>

          <p className="font-script text-xl text-amber-300/90 text-center">
            Tradición que se siente en cada rincón.
          </p>

          <div className="flex items-center gap-3 text-slate-400">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-lg hover:bg-slate-900 hover:text-white transition"
            >
              <Icon name="instagram" size={18} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-lg hover:bg-slate-900 hover:text-white transition"
            >
              <Icon name="facebook" size={18} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="p-2 rounded-lg hover:bg-slate-900 hover:text-white transition"
            >
              <Icon name="youtube" size={18} />
            </a>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-subtitle">
          <p>© {new Date().getFullYear()} Cochabamba Turismo · Riqsi Rutas. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-slate-300 transition">Privacidad</a>
            <a href="#" className="hover:text-slate-300 transition">Términos</a>
            <a href="#" className="hover:text-slate-300 transition">Contacto</a>
          </div>
        </div>
      </div>
      <div className="aguayo-strip h-1 w-full" />
    </footer>
  );
};
