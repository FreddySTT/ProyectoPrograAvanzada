import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { validatePasswordPolicy } from "../utils/security";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register" | "recover";
  onNotify?: (msg: string) => void;
}

const AVATAR_OPTIONS = ["🎒", "🌸", "🏔️", "🦅", "☀️", "🚲", "🥟"];

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onNotify,
}: AuthModalProps) {
  const { login, register, requestPasswordReset, isLockedOut, lockoutRemaining } = useAuth();
  const [tab, setTab] = useState<"login" | "register" | "recover">(defaultTab);

  // Login form state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAvatar, setRegAvatar] = useState("🎒");
  const [regError, setRegError] = useState("");

  // Recover form state
  const [recUser, setRecUser] = useState("");
  const [recMasterKey, setRecMasterKey] = useState("");
  const [recNewPassword, setRecNewPassword] = useState("");
  const [recError, setRecError] = useState("");
  const [recSuccess, setRecSuccess] = useState("");

  // Validación de política de contraseñas en tiempo real
  const regPolicy = validatePasswordPolicy(regPassword);
  const recPolicy = validatePasswordPolicy(recNewPassword);

  useEffect(() => {
    setTab(defaultTab);
    setLoginError("");
    setRegError("");
    setRecError("");
    setRecSuccess("");
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError("Por favor ingresa usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginUser, loginPass);
      if (res.success) {
        if (onNotify) onNotify(res.message);
        onClose();
      } else {
        setLoginError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegError("Completa todos los campos obligatorios.");
      return;
    }

    // Validación estricta de política: 8 chars, 1 mayúscula, 1 signo
    if (!regPolicy.isValid) {
      setRegError(regPolicy.message);
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        avatar: regAvatar,
      });

      if (res.success) {
        if (onNotify) onNotify(res.message);
        onClose();
      } else {
        setRegError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecError("");
    setRecSuccess("");

    if (!recUser.trim() || !recMasterKey.trim() || !recNewPassword.trim()) {
      setRecError("Todos los campos son obligatorios para restablecer la contraseña.");
      return;
    }

    // Validación estricta de política para nueva contraseña
    if (!recPolicy.isValid) {
      setRecError(recPolicy.message);
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(recUser, recMasterKey, recNewPassword);
      if (res.success) {
        setRecSuccess(res.message);
        if (onNotify) onNotify(res.message);
        setRecMasterKey("");
        setRecNewPassword("");
        setTimeout(() => setTab("login"), 1500);
      } else {
        setRecError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper para rellenar credenciales demo
  const fillDemoAccount = (user: string, pass: string) => {
    setLoginUser(user);
    setLoginPass(pass);
    setLoginError("");
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
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#E8E3D8] bg-[#FAF7F2]">
          <div>
            <h2 className="font-subtitle text-xl font-black text-[#37474F]">
              {tab === "login"
                ? "Acceso a Riqsi Rutas"
                : tab === "register"
                ? "Crear Cuenta de Viajero"
                : "Recuperar Contraseña"}
            </h2>
            <p className="text-xs text-[#6D4C41] mt-0.5">
              {tab === "login"
                ? "Inicia sesión para personalizar tus rutas en Cochabamba"
                : tab === "register"
                ? "Únete a la comunidad de viajeros y explora la Llajta"
                : "Restablece el acceso de forma segura"}
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
        <div className="grid grid-cols-3 p-1.5 bg-[#F5E6D3]/40 border-b border-[#E8E3D8] text-xs font-subtitle font-bold text-center">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`py-2 rounded-xl transition ${
              tab === "login"
                ? "bg-white text-[#D81B60] shadow-sm font-extrabold"
                : "text-[#6D4C41] hover:text-[#37474F]"
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`py-2 rounded-xl transition ${
              tab === "register"
                ? "bg-white text-[#D81B60] shadow-sm font-extrabold"
                : "text-[#6D4C41] hover:text-[#37474F]"
            }`}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => setTab("recover")}
            className={`py-2 rounded-xl transition ${
              tab === "recover"
                ? "bg-white text-[#D81B60] shadow-sm font-extrabold"
                : "text-[#6D4C41] hover:text-[#37474F]"
            }`}
          >
            Recuperar
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          {/* Lockout Notice */}
          {isLockedOut && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-800">
              <div className="flex items-center gap-2 font-bold mb-1">
                <span>🛡️ Acceso bloqueado temporalmente</span>
              </div>
              <p>
                Por protección ante múltiples intentos fallidos, el acceso está restringido.
                Podrás volver a intentar en:{" "}
                <strong className="font-mono text-red-900">{lockoutRemaining} segundos</strong>.
              </p>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === "login" && (
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
                  placeholder="ej. admin o carlos@gmail.com"
                  disabled={isLockedOut || loading}
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none disabled:opacity-50"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-subtitle font-bold text-[#37474F]">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab("recover")}
                    className="text-[11px] text-[#D81B60] hover:underline font-semibold"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLockedOut || loading}
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Demo Accounts Pill Buttons with Security-Compliant Passwords */}
              <div className="rounded-2xl bg-[#FAF7F2] border border-[#E2D9CC] p-3 text-xs">
                <p className="font-subtitle font-bold text-[#37474F] mb-2 flex items-center justify-between">
                  <span>Acceso rápido (Cuentas Demo):</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    🛡️ Encriptación SHA-256
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("admin", "Admin@2026!")}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F5E6D3] border border-[#E2D9CC] transition flex items-center justify-between text-[11px]"
                  >
                    <span className="font-bold text-[#37474F]">👑 Admin</span>
                    <span className="text-[10px] text-gray-500 font-mono">Admin@2026!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("turista", "Turista@2026!")}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F5E6D3] border border-[#E2D9CC] transition flex items-center justify-between text-[11px]"
                  >
                    <span className="font-bold text-[#37474F]">🎒 Turista</span>
                    <span className="text-[10px] text-gray-500 font-mono">Turista@2026!</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLockedOut || loading}
                className="w-full rounded-full bg-[#D81B60] py-3 text-sm font-subtitle font-extrabold text-white shadow-lg shadow-[#D81B60]/30 hover:bg-[#b0144c] hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Ingresar a Riqsi Rutas</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="rounded-xl bg-[#FFF1F2] border border-[#FECDD3] p-3 text-xs font-bold text-[#BE123C]">
                  ⚠️ {regError}
                </div>
              )}

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="ej. Mateo Morales"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="ej. mateo_viajes"
                    className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="mateo@gmail.com"
                    className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Contraseña Segura
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 signo"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  required
                />

                {/* Real-time strict password policy checklist */}
                <div className="mt-2 space-y-1 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] p-2.5 text-[11px]">
                  <div className="font-subtitle font-bold text-[#37474F] mb-1">
                    Requisitos obligatorios de seguridad:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={regPolicy.checks.minLength ? "text-emerald-600 font-extrabold" : "text-gray-400"}>
                      {regPolicy.checks.minLength ? "✓" : "○"}
                    </span>
                    <span className={regPolicy.checks.minLength ? "text-emerald-700 font-bold" : "text-[#6D4C41]"}>
                      Mínimo 8 caracteres ({regPassword.length}/8)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={regPolicy.checks.uppercase ? "text-emerald-600 font-extrabold" : "text-gray-400"}>
                      {regPolicy.checks.uppercase ? "✓" : "○"}
                    </span>
                    <span className={regPolicy.checks.uppercase ? "text-emerald-700 font-bold" : "text-[#6D4C41]"}>
                      Al menos una letra mayúscula (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={regPolicy.checks.specialChar ? "text-emerald-600 font-extrabold" : "text-gray-400"}>
                      {regPolicy.checks.specialChar ? "✓" : "○"}
                    </span>
                    <span className={regPolicy.checks.specialChar ? "text-emerald-700 font-bold" : "text-[#6D4C41]"}>
                      Al menos un signo o símbolo especial (!@#$%&*...)
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de Avatar */}
              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Elige tu Avatar de Viajero
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

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] text-emerald-800">
                🔒 <strong>Zero-Storage Garantizado:</strong> Nada se guarda en tu disco ni en localStorage. Contraseña encriptada con SHA-256 de alta entropía.
              </div>

              <button
                type="submit"
                disabled={loading || !regPolicy.isValid}
                className="w-full mt-2 rounded-full bg-[#D81B60] py-3 text-sm font-subtitle font-extrabold text-white shadow-lg shadow-[#D81B60]/30 hover:bg-[#b0144c] hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
              >
                {loading ? "Creando cuenta segura..." : "Registrar y Comenzar"}
              </button>
            </form>
          )}

          {/* TAB 3: RECOVER PASSWORD */}
          {tab === "recover" && (
            <form onSubmit={handleRecoverSubmit} className="space-y-3.5">
              {recError && (
                <div className="rounded-xl bg-[#FFF1F2] border border-[#FECDD3] p-3 text-xs font-bold text-[#BE123C]">
                  ⚠️ {recError}
                </div>
              )}
              {recSuccess && (
                <div className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-3 text-xs font-bold text-[#065F46]">
                  ✅ {recSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Usuario o Correo Registrado *
                </label>
                <input
                  type="text"
                  value={recUser}
                  onChange={(e) => setRecUser(e.target.value)}
                  placeholder="ej. admin o carlos@gmail.com"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Clave de Autorización Maestra *
                </label>
                <input
                  type="password"
                  value={recMasterKey}
                  onChange={(e) => setRecMasterKey(e.target.value)}
                  placeholder="Introduce la Clave Maestra de Seguridad..."
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-subtitle font-bold text-[#37474F] mb-1">
                  Nueva Contraseña Segura *
                </label>
                <input
                  type="password"
                  value={recNewPassword}
                  onChange={(e) => setRecNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 signo"
                  className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
                  required
                />

                {/* Real-time checklist for new password */}
                <div className="mt-2 space-y-1 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] p-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={recPolicy.checks.minLength ? "text-emerald-600 font-extrabold" : "text-gray-400"}>
                      {recPolicy.checks.minLength ? "✓" : "○"}
                    </span>
                    <span className={recPolicy.checks.minLength ? "text-emerald-700 font-bold" : "text-[#6D4C41]"}>
                      Mínimo 8 caracteres ({recNewPassword.length}/8)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={recPolicy.checks.uppercase ? "text-emerald-600 font-extrabold" : "text-gray-400"}>
                      {recPolicy.checks.uppercase ? "✓" : "○"}
                    </span>
                    <span className={recPolicy.checks.uppercase ? "text-emerald-700 font-bold" : "text-[#6D4C41]"}>
                      Al menos una letra mayúscula (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={recPolicy.checks.specialChar ? "text-emerald-600 font-extrabold" : "text-gray-400"}>
                      {recPolicy.checks.specialChar ? "✓" : "○"}
                    </span>
                    <span className={recPolicy.checks.specialChar ? "text-emerald-700 font-bold" : "text-[#6D4C41]"}>
                      Al menos un signo o símbolo especial (!@#$%&*...)
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-800">
                🛡️ <strong>Protocolo de Emergencia:</strong> Esta función permite restablecer contraseñas validadas mediante la Clave Maestra de Administrador de Riqsi Rutas.
              </div>

              <button
                type="submit"
                disabled={loading || !recPolicy.isValid}
                className="w-full mt-2 rounded-full bg-[#1E293B] py-3 text-sm font-subtitle font-extrabold text-white shadow-lg hover:bg-[#334155] transition disabled:opacity-50"
              >
                {loading ? "Restableciendo clave..." : "Restablecer Contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
