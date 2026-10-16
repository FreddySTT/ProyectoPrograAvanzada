import { useState, useEffect } from "react";
import { useAuth, MASTER_ADMIN_SECURITY_KEY } from "../context/AuthContext";
import {
  isFirebaseLiveConfigured,
  getActiveFirebaseConfig,
  saveCustomConfig,
  clearCustomConfig,
  type FirebaseConfig,
} from "../firebase/config";

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export function AdminPortalModal({ isOpen, onClose, onNotify }: AdminPortalModalProps) {
  const {
    currentUser,
    isEffectiveAdmin,
    elevateToAdmin,
    securityLogs,
    isLockedOut,
    lockoutRemaining,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"auth" | "logs" | "firebase">("auth");
  const [securityKeyInput, setSecurityKeyInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showKeyHint, setShowKeyHint] = useState(false);

  // Firebase Config Form state
  const isLive = isFirebaseLiveConfigured();
  const currentConfig = getActiveFirebaseConfig();
  const [fbApiKey, setFbApiKey] = useState(currentConfig.apiKey || "");
  const [fbAuthDomain, setFbAuthDomain] = useState(currentConfig.authDomain || "");
  const [fbProjectId, setFbProjectId] = useState(currentConfig.projectId || "");
  const [fbStorageBucket, setFbStorageBucket] = useState(currentConfig.storageBucket || "");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(currentConfig.messagingSenderId || "");
  const [fbAppId, setFbAppId] = useState(currentConfig.appId || "");

  useEffect(() => {
    if (!isOpen) {
      setSecurityKeyInput("");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleElevate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!securityKeyInput.trim()) {
      setErrorMsg("Por favor introduce la Clave Maestra de Seguridad.");
      return;
    }

    const res = await elevateToAdmin(securityKeyInput);
    if (res.success) {
      setSuccessMsg(res.message);
      if (onNotify) onNotify(res.message);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbApiKey.trim() || !fbProjectId.trim()) {
      setErrorMsg("ApiKey y ProjectId son campos indispensables de Firebase.");
      return;
    }

    const newConfig: FirebaseConfig = {
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim(),
      projectId: fbProjectId.trim(),
      storageBucket: fbStorageBucket.trim(),
      messagingSenderId: fbMessagingSenderId.trim(),
      appId: fbAppId.trim(),
    };

    saveCustomConfig(newConfig);
    if (onNotify) onNotify("¡Configuración de Firebase guardada! Recargando para conectar...");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] bg-[#0F172A] text-white shadow-2xl border-2 border-[#F4C430]/70 flex flex-col max-h-[90vh]">
        {/* Top Aguayo strip */}
        <div className="aguayo-strip h-2 w-full shrink-0" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 bg-[#1E293B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4C430] text-black font-black text-xl shadow-md">
              🛡️
            </span>
            <div>
              <h2 className="font-subtitle text-lg font-black tracking-wide text-[#F4C430] flex items-center gap-2">
                Portal de Seguridad & Backend
                <span className="rounded-full bg-red-600/30 text-red-300 text-[10px] font-mono px-2 py-0.5 border border-red-500/40">
                  Acceso Restringido
                </span>
              </h2>
              <p className="text-xs text-white/70">
                Sistema de control blindado para Riqsi Rutas Cochabamba
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Subheader Navigation */}
        <div className="flex border-b border-white/10 bg-[#141E33] px-5 text-xs font-subtitle font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("auth")}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === "auth"
                ? "border-[#F4C430] text-[#F4C430]"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            🔑 Llave Maestra
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("firebase")}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "firebase"
                ? "border-[#38BDF8] text-[#38BDF8]"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            🔥 Firebase Backend
            <span
              className={`h-2 w-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-amber-400"}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "border-[#D81B60] text-[#D81B60]"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            📜 Auditoría ({securityLogs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5 text-sm">
          {errorMsg && (
            <div className="rounded-xl bg-red-950/80 border border-red-500/50 p-3 text-xs font-bold text-red-200">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-green-950/80 border border-green-500/50 p-3 text-xs font-bold text-green-200">
              ✅ {successMsg}
            </div>
          )}

          {/* TAB 1: MASTER SECURITY AUTH */}
          {activeTab === "auth" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-subtitle text-xs uppercase tracking-wider text-[#F4C430] font-bold">
                    Estado de Sesión
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isEffectiveAdmin
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {isEffectiveAdmin ? "👑 Administrador Activo" : "🎒 Turista / Visitante"}
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  {currentUser
                    ? `Autenticado como: ${currentUser.name} (${currentUser.email || currentUser.username})`
                    : "No has iniciado sesión de usuario."}
                </p>
              </div>

              {isEffectiveAdmin ? (
                <div className="rounded-2xl bg-emerald-950/50 border border-emerald-500/40 p-4 text-center space-y-2">
                  <p className="text-emerald-300 font-bold text-sm">
                    ✨ Tienes privilegios totales de Administrador activados.
                  </p>
                  <p className="text-xs text-emerald-200/70">
                    Puedes agregar, editar o destacar destinos, modificar el comunicado oficial y gestionar usuarios desde el panel flotante inferior.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleElevate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-subtitle font-bold text-white/90 mb-1.5 flex items-center justify-between">
                      <span>Clave Maestra de Seguridad (PIN de Gestión)</span>
                      <button
                        type="button"
                        onClick={() => setShowKeyHint(!showKeyHint)}
                        className="text-[10px] text-[#F4C430] hover:underline"
                      >
                        {showKeyHint ? "Ocultar pista" : "¿Olvidaste la clave?"}
                      </button>
                    </label>
                    <input
                      type="password"
                      value={securityKeyInput}
                      onChange={(e) => setSecurityKeyInput(e.target.value)}
                      placeholder="Introduce la Clave Maestra de Seguridad..."
                      disabled={isLockedOut}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#F4C430] focus:bg-white/10 focus:outline-none"
                      autoFocus
                    />
                    {showKeyHint && (
                      <p className="mt-1.5 text-[11px] text-[#F4C430] bg-[#F4C430]/10 p-2 rounded-lg border border-[#F4C430]/20 font-mono">
                        💡 Clave Maestra inicial configurada: <code>{MASTER_ADMIN_SECURITY_KEY}</code>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLockedOut}
                    className="w-full rounded-xl bg-[#F4C430] py-3 text-sm font-subtitle font-black text-black shadow-lg shadow-[#F4C430]/20 hover:bg-[#e0b020] hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
                  >
                    Desbloquear Panel Administrador
                  </button>
                </form>
              )}

              {/* Security info tips */}
              <div className="rounded-xl bg-blue-950/40 border border-blue-500/30 p-3.5 space-y-1.5 text-xs text-blue-200">
                <p className="font-bold flex items-center gap-1.5 text-blue-300">
                  <span>🛡️ Blindaje de Seguridad Activo:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-200/80 text-[11px]">
                  <li>Los visitantes que abran el link no ven accesos directos ni pueden registrarse como Admin.</li>
                  <li>Acceso protegido por atajo de teclado: <kbd className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-white">Ctrl + Shift + A</kbd> o enlace seguro <code className="text-[#F4C430]">#portal-admin</code>.</li>
                  <li>Bloqueo automático de 60 segundos ante 5 intentos erróneos.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: FIREBASE BACKEND CONFIG */}
          {activeTab === "firebase" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="font-bold text-xs text-white">
                      Estado: {isLive ? "🟢 Conectado a Firebase Cloud" : "🟡 Modo Local Seguro (Simulado)"}
                    </p>
                    <p className="text-[11px] text-white/60">
                      {isLive
                        ? `Proyecto activo: ${currentConfig.projectId}`
                        : "Puedes conectar tu propio proyecto de Google Firebase aquí sin tocar código."}
                    </p>
                  </div>
                </div>
                {isLive && (
                  <button
                    onClick={clearCustomConfig}
                    className="rounded-lg bg-red-900/60 hover:bg-red-800 px-2.5 py-1 text-[11px] text-red-200 font-bold transition"
                  >
                    Desconectar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveFirebaseConfig} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Firebase API Key *
                    </label>
                    <input
                      type="text"
                      value={fbApiKey}
                      onChange={(e) => setFbApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Project ID *
                    </label>
                    <input
                      type="text"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      placeholder="mi-proyecto-cbba"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Auth Domain
                    </label>
                    <input
                      type="text"
                      value={fbAuthDomain}
                      onChange={(e) => setFbAuthDomain(e.target.value)}
                      placeholder="mi-proyecto.firebaseapp.com"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Storage Bucket
                    </label>
                    <input
                      type="text"
                      value={fbStorageBucket}
                      onChange={(e) => setFbStorageBucket(e.target.value)}
                      placeholder="mi-proyecto.appspot.com"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      Messaging Sender ID
                    </label>
                    <input
                      type="text"
                      value={fbMessagingSenderId}
                      onChange={(e) => setFbMessagingSenderId(e.target.value)}
                      placeholder="1234567890"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      App ID
                    </label>
                    <input
                      type="text"
                      value={fbAppId}
                      onChange={(e) => setFbAppId(e.target.value)}
                      placeholder="1:123456789:web:abcdef"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0284C7] hover:bg-[#0369A1] py-2.5 text-xs font-subtitle font-bold text-white shadow transition"
                >
                  Guardar y Conectar a Firebase
                </button>
              </form>

              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white/70 space-y-1">
                <p className="font-bold text-white/90">¿Cómo crear tu proyecto en Firebase?</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Entra a <strong>console.firebase.google.com</strong> y crea un proyecto.</li>
                  <li>Activa <strong>Authentication</strong> (Proveedor Correo/Contraseña).</li>
                  <li>Crea tu base de datos <strong>Cloud Firestore</strong> en modo producción.</li>
                  <li>Copia tus credenciales web y pégalas arriba o en tu archivo <code>.env</code>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Últimos eventos registrados por el sistema de seguridad:</span>
                <span className="font-mono text-[#F4C430]">{securityLogs.length} eventos</span>
              </div>

              {securityLogs.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  No hay registros de seguridad aún.
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {securityLogs.map((log) => {
                    const statusColor =
                      log.status === "OK"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : log.status === "WARNING"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-red-500/10 text-red-300 border-red-500/30";

                    return (
                      <div
                        key={log.id}
                        className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                            {log.event}
                          </span>
                          <span className="text-[10px] text-white/50 font-mono">
                            {new Date(log.timestamp).toLocaleString("es-BO")}
                          </span>
                        </div>
                        <p className="text-white/90 text-xs font-semibold">{log.details}</p>
                        <p className="text-[10px] text-white/50">
                          Usuario: <span className="text-white/70 font-mono">{log.userEmail}</span>
                          {log.role && (
                            <> · Rol: <span className="text-[#F4C430] font-bold">{log.role}</span></>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
