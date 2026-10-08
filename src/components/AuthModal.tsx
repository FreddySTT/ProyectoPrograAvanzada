import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onNotify?: (msg: string) => void;
}

const AVATAR_OPTIONS = ["🎒", "🌸", "🏔️", "🦅", "☀️", "🚲", "🥟", "👑"];

export function AuthModal({ isOpen, onClose, defaultTab = "login", onNotify }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  // Login form state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<Role>("normal");
  const [regAvatar, setRegAvatar] = useState("🎒");
  const [regError, setRegError] = useState("");

  useEffect(() => {
    setTab(defaultTab);
    setLoginError("");
    setRegError("");
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError("Por favor ingresa usuario y contraseña.");
      return;
    }

    const res = login(loginUser, loginPass);
    if (res.success) {
      if (onNotify) onNotify(res.message);
      onClose();
    } else {
      setLoginError(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegError("Completa todos los campos obligatorios.");
      return;
    }

    if (regPassword.length < 3) {
      setRegError("La contraseña debe tener al menos 3 caracteres.");
      return;
    }

    const res = register({
      name: regName,
      username: regUsername,
      email: regEmail,
      password: regPassword,
      role: regRole,
      avatar: regAvatar,
    });

    if (res.success) {
      if (onNotify) onNotify(res.message);
      onClose();
    } else {
      setRegError(res.message);
    }
  };

  const quickLogin = (u: string, p: string) => {
    setLoginUser(u);
    setLoginPass(p);
    const res = login(u, p);
    if (res.success) {
      if (onNotify) onNotify(res.message);
      onClose();
    } else {
      setLoginError(res.message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl border border-[#E2D9CC] flex flex-col max-h-[92vh]">
        {/* Top aguayo strip */}
        <div className="aguayo-strip h-2 w-full" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#E8E3D8] bg-[#FAF7F2] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h2 className="font-subtitle text-xl font-extrabold text-[#37474F]">
                {tab === "login" ? "Acceso a Riqsi Rutas" : "Crear Nueva Cuenta"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#6D4C41]">
              {tab === "login"
                ? "Inicia sesión para personalizar tus rutas en Cochabamba"
                : "Únete a la comunidad de viajeros y creadores de la Llajta"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#6D4C41] hover:bg-[#D81B60] hover:text-white transition shadow-sm"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-2 bg-[#F5E6D3]/40 border-b border-[#E8E3D8] text-xs font-subtitle font-bold">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`py-2 rounded-xl transition ${
              tab === "login"
                ? "bg-white text-[#D81B60] shadow-sm"
                : "text-[#6D4C41] hover:text-[#37474F]"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`py-2 rounded-xl transition ${
              tab === "register"
                ? "bg-white text-[#D81B60] shadow-sm"
                : "text-[#6D4C41] hover:text-[#37474F]"
            }`}
          >
            Crear Usuario
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Quick Demo Access Bar */}
          <div className="rounded-2xl bg-[#FFF8EE] border border-[#FDE68A] p-3.5">
            <p className="font-subtitle text-[11px] font-black uppercase tracking-wider text-[#B45309] mb-2 flex items-center gap-1.5">
              <span>⚡ Acceso Rápido para Pruebas:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("admin", "admin")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1E293B] text-white px-2.5 py-2 text-xs font-subtitle font-bold hover:bg-[#334155] transition shadow-sm"
                title="Usuario: admin | Contraseña: admin"
              >
                <span>👑 Administrador</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("turista", "123")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#D81B60] text-white px-2.5 py-2 text-xs font-subtitle font-bold hover:bg-[#b0144c] transition shadow-sm"
                title="Usuario: turista | Contraseña: 123"
              >
                <span>🎒 Turista Normal</span>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#78350F] text-center">
              (Admin tiene acceso a agregar y seleccionar rutas; Turista ve la página limpia)
            </p>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="rounded-xl bg-[#FFF1F2] border border-[#FECDD3] p-3 text-xs font-bold text-[#BE123C]">
                  ⚠️ {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Usuario o Correo
                </label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="ej. admin o viajero"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#D81B60] py-3 text-sm font-subtitle font-extrabold text-white shadow-lg shadow-[#D81B60]/30 hover:bg-[#b0144c] hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Ingresar a Riqsi Rutas
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="rounded-xl bg-[#FFF1F2] border border-[#FECDD3] p-3 text-xs font-bold text-[#BE123C]">
                  ⚠️ {regError}
                </div>
              )}

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="ej. María Morales"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="ej. maria26"
                    className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="maria@ejemplo.com"
                    className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 3 caracteres"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Selector de tipo de usuario */}
              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1.5">
                  Tipo de Usuario (Rol)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("normal")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                      regRole === "normal"
                        ? "border-[#D81B60] bg-[#FFF1F2] text-[#D81B60] font-bold"
                        : "border-[#E2D9CC] bg-white text-[#6D4C41]"
                    }`}
                  >
                    <span className="text-lg">🎒</span>
                    <div>
                      <p className="text-xs font-subtitle">Normal / Turista</p>
                      <p className="text-[10px] text-[#6D4C41] font-normal">Visita y explora</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole("admin")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                      regRole === "admin"
                        ? "border-[#F4C430] bg-[#1E293B] text-[#F4C430] font-bold"
                        : "border-[#E2D9CC] bg-white text-[#6D4C41]"
                    }`}
                  >
                    <span className="text-lg">👑</span>
                    <div>
                      <p className="text-xs font-subtitle">Administrador</p>
                      <p className="text-[10px] text-gray-400 font-normal">Edita y aumenta</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Selector de Avatar */}
              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Elige tu Avatar
                </label>
                <div className="flex gap-2 justify-between">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setRegAvatar(av)}
                      className={`h-9 w-9 rounded-xl grid place-items-center text-lg transition ${
                        regAvatar === av
                          ? "bg-[#D81B60] text-white scale-110 shadow"
                          : "bg-[#FAF7F2] hover:bg-[#E8E3D8]"
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-full bg-[#D81B60] py-3 text-sm font-subtitle font-extrabold text-white shadow-lg shadow-[#D81B60]/30 hover:bg-[#b0144c] hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Registrar y Comenzar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
