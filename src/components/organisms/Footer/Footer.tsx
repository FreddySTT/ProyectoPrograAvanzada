import React from "react";
import { Icon } from "../../atoms/Icon/Icon";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1E293B] text-white/80">
      <div className="aguayo-strip h-1.5" />
      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-[#F4C430] border border-white/20">
              <Icon name="mountain" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-subtitle text-xl font-bold text-white tracking-tight">Cochabamba</span>
              <span className="font-subtitle text-[10px] tracking-widest text-[#F4C430]">BOLIVIA</span>
            </div>
          </div>

          <p className="font-script text-2xl text-[#F4C430] text-center">
            Tradición que se siente en cada rincón.
          </p>

          <div className="flex items-center gap-4 text-white/90">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-full hover:bg-white/10 hover:text-[#D81B60] transition"
            >
              <Icon name="instagram" size={20} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-full hover:bg-white/10 hover:text-[#F7931E] transition"
            >
              <Icon name="facebook" size={20} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="p-2 rounded-full hover:bg-white/10 hover:text-[#D81B60] transition"
            >
              <Icon name="youtube" size={20} />
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-subtitle">
          <p>© {new Date().getFullYear()} Cochabamba Turismo · Riqsi Rutas. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition">Privacidad</a>
            <a href="#" className="hover:text-white transition">Términos</a>
            <a href="#" className="hover:text-white transition">Contacto</a>
          </div>
        </div>
      </div>

      <div className="aguayo-strip h-2.5 w-full" />
    </footer>
  );
};
