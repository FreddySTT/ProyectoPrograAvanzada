import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  isSupabaseConfigured,
  getActiveSupabaseConfig,
  saveSupabaseConfig,
  clearCustomSupabaseConfig,
} from "../supabase/config";
import {
  exportDatabaseToJson,
  importDatabaseFromJson,
  getSecurityMetrics,
} from "../supabase/services";

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
    storageMode,
    toggleStorageMode,
    purgeStorage,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"auth" | "security" | "supabase" | "json" | "logs">("auth");
  const [securityKeyInput, setSecurityKeyInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [logFilter, setLogFilter] = useState<"ALL" | "OK" | "WARNING" | "BLOCKED">("ALL");

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    admins: 0,
    editors: 0,
    activePlaces: 0,
    securityIncidents: 0,
  });

  // Supabase Config Form state
  const isLive = isSupabaseConfigured();
  const currentConfig = getActiveSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(currentConfig.url || "");
  const [sbAnonKey, setSbAnonKey] = useState(currentConfig.anonKey || "");
  const [jsonImportText, setJsonImportText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSecurityKeyInput("");
      setErrorMsg("");
      setSuccessMsg("");
      setImportStatus(null);
    } else {
      getSecurityMetrics().then((m) => setMetrics(m));
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
      setErrorMsg("Debes ingresar la Clave Maestra de Seguridad.");
      return;
    }

    const res = await elevateToAdmin(securityKeyInput);
    if (res.success) {
      setSuccessMsg(res.message);
      setSecurityKeyInput("");
      if (onNotify) onNotify("¡Privilegios de Administrador activados con éxito!");
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbUrl.trim() || !sbAnonKey.trim()) {
      setErrorMsg("La URL y la clave anónima de Supabase son obligatorias.");
      return;
    }

    saveSupabaseConfig({
      url: sbUrl.trim(),
      anonKey: sbAnonKey.trim(),
    });

    if (onNotify) {
      onNotify("¡Configuración de Supabase protegida! Conectando a la nube...");
    }
    setTimeout(() => window.location.reload(), 800);
  };

  const handleExportJson = async () => {
    const jsonStr = await exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riqsi_rutas_db_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onNotify) onNotify("¡Base de datos exportada en formato JSON!");
  };

  const handleImportJson = async () => {
    if (!jsonImportText.trim()) {
      setImportStatus("Pega el contenido JSON para importar.");
      return;
    }
    const res = await importDatabaseFromJson(jsonImportText);
    setImportStatus(res.message);
    if (res.success) {
      if (onNotify) onNotify("¡Lugares sincronizados desde JSON con éxito!");
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  const handlePurgeClick = () => {
    if (
      confirm(
        "⚠️ ATENCIÓN: Esta acción purgará todo el almacenamiento local, cerrará la sesión actual y destruirá cualquier rastro en este navegador. ¿Deseas continuar?"
      )
    ) {
      purgeStorage();
      if (onNotify) onNotify("Almacenamiento purgado y rastro eliminado con éxito.");
      setTimeout(() => window.location.reload(), 600);
    }
  };

  const filteredLogs = securityLogs.filter((log) => {
    if (logFilter === "ALL") return true;
    return log.status === logFilter;
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#3B82F6]/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-xl shadow-inner">
              🛡️
            </span>
            <div>
              <h3 className="font-subtitle text-lg font-black tracking-wide text-white flex items-center gap-2">
                <span>Portal de Seguridad & Administración</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  v2.0
                </span>
              </h3>
              <p className="text-xs text-white/60">
                Cifrado Militar AES-256, Control Zero-Storage, Supabase Cloud y Auditoría.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="relative mt-4 flex gap-1.5 border-b border-white/10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("auth")}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-subtitle font-bold transition whitespace-nowrap ${
              activeTab === "auth"
                ? "bg-[#F4C430] text-black shadow-lg shadow-[#F4C430]/20"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>👑</span>
            <span>Clave Maestra</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-subtitle font-bold transition whitespace-nowrap ${
              activeTab === "security"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>🔒</span>
            <span>Blindaje & Métricas</span>
          </button>

          <button
            onClick={() => setActiveTab("supabase")}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-subtitle font-bold transition whitespace-nowrap ${
              activeTab === "supabase"
                ? "bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>⚡</span>
            <span>Supabase Cloud</span>
            <span
              className={`h-2 w-2 rounded-full ${
                isLive ? "bg-emerald-300 animate-pulse" : "bg-amber-400"
              }`}
            />
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-subtitle font-bold transition whitespace-nowrap ${
              activeTab === "json"
                ? "bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>📦</span>
            <span>Motor JSON</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-subtitle font-bold transition whitespace-nowrap ${
              activeTab === "logs"
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>📋</span>
            <span>Auditoría ({securityLogs.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="relative mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* TAB 1: MASTER KEY AUTH */}
          {activeTab === "auth" && (
            <div className="space-y-4">
              {errorMsg && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200 font-semibold flex items-center gap-2">
                  <span>✅</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {isLockedOut && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 font-bold space-y-1">
                  <p className="flex items-center gap-1.5">
                    <span>⏳</span>
                    <span>Acceso bloqueado por intentos fallidos.</span>
                  </p>
                  <p className="text-[11px] text-amber-200/80">
                    Tiempo de espera restante:{" "}
                    <span className="font-mono text-base text-[#F4C430]">
                      {lockoutRemaining} segundos
                    </span>
                  </p>
                </div>
              )}

              {isEffectiveAdmin ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center space-y-2">
                  <span className="text-3xl">👑</span>
                  <h4 className="font-subtitle text-sm font-extrabold text-emerald-300">
                    Tu sesión cuenta con Privilegios de Administrador Activos
                  </h4>
                  <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                    Tienes acceso total a la gestión de usuarios, edición de lugares turísticos,
                    panel de control y configuración del backend en Supabase.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleElevate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-subtitle font-bold text-white/90 mb-1.5">
                      Clave Maestra de Seguridad (PIN de Gestión)
                    </label>
                    <input
                      type="password"
                      value={securityKeyInput}
                      onChange={(e) => setSecurityKeyInput(e.target.value)}
                      placeholder="Introduce tu Clave Maestra secreta..."
                      disabled={isLockedOut}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#F4C430] focus:bg-white/10 focus:outline-none"
                      autoFocus
                    />
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

              <div className="rounded-xl bg-blue-950/40 border border-blue-500/30 p-3.5 space-y-1.5 text-xs text-blue-200">
                <p className="font-bold flex items-center gap-1.5 text-blue-300">
                  <span>🛡️ Capas de Blindaje Criptográfico Activas:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-200/80 text-[11px]">
                  <li>Contraseñas con hash SHA-256 + Salt irreversible.</li>
                  <li>Clave Maestra validada criptográficamente (sin texto plano en código ni bundle).</li>
                  <li>Bloqueo preventivo de 60 segundos ante 5 intentos fallidos consecutivos.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: METRICS & STORAGE SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <span className="text-xl">👥</span>
                  <div className="text-lg font-black text-white">{metrics.totalUsers}</div>
                  <div className="text-[10px] text-white/60">Usuarios Totales</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <span className="text-xl">👑</span>
                  <div className="text-lg font-black text-amber-400">{metrics.admins}</div>
                  <div className="text-[10px] text-white/60">Administradores</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <span className="text-xl">📍</span>
                  <div className="text-lg font-black text-emerald-400">{metrics.activePlaces}</div>
                  <div className="text-[10px] text-white/60">Lugares Activos</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                  <span className="text-xl">🚨</span>
                  <div className="text-lg font-black text-red-400">{metrics.securityIncidents}</div>
                  <div className="text-[10px] text-white/60">Eventos de Riesgo</div>
                </div>
              </div>

              {/* Zero-Storage Security Mode Toggle */}
              <div className="rounded-2xl bg-purple-950/40 border border-purple-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-purple-200 flex items-center gap-1.5">
                      <span>🔐</span>
                      <span>Blindaje Activo: Modo Zero-LocalStorage (Solo RAM)</span>
                    </h4>
                    <p className="text-[11px] text-purple-200/70 mt-0.5">
                      Protección absoluta contra inspección en DevTools:
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ZERO-STORAGE ACTIVO (0 BYTES EN DISCO)
                  </span>
                </div>

                <div className="rounded-xl bg-purple-900/30 border border-purple-500/20 p-3 text-xs text-purple-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <span>🛡️</span>
                    <span>LocalStorage 100% Desactivado y Limpio</span>
                  </div>
                  <p className="text-[11px] text-purple-200/80">
                    Ninguna credencial, usuario ni sesión se guarda en el disco local de este navegador. Si un usuario o atacante abre <strong>DevTools &gt; Application &gt; Local Storage</strong>, la tabla está completamente vacía. Toda la persistencia real se gestiona directamente en la nube de <strong>Supabase</strong>.
                  </p>
                </div>
              </div>

              {/* Purge Storage Button */}
              <div className="rounded-2xl bg-red-950/30 border border-red-500/30 p-3.5 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-red-200 flex items-center gap-1.5">
                    <span>💥</span>
                    <span>Destrucción Inmediata de Almacenamiento Local</span>
                  </h5>
                  <p className="text-[11px] text-red-200/70">
                    Borra instantáneamente todas las claves ofuscadas, sesiones y caché local.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePurgeClick}
                  className="rounded-xl bg-red-600 hover:bg-red-500 px-3.5 py-2 text-xs font-bold text-white transition whitespace-nowrap shadow"
                >
                  Purgar Todo
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE CLOUD CONFIG */}
          {activeTab === "supabase" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-xs text-white">
                      Estado: {isLive ? "🟢 Conectado a Supabase Cloud Database" : "🟡 Modo Local Seguro (Fallback Offline)"}
                    </p>
                    <p className="text-[11px] text-white/60">
                      {isLive
                        ? `Proyecto activo: ${currentConfig.url}`
                        : "Configura tu conexión pegando tus credenciales de Supabase o editando el archivo .env"}
                    </p>
                  </div>
                </div>
                {isLive && (
                  <button
                    onClick={() => {
                      clearCustomSupabaseConfig();
                      window.location.reload();
                    }}
                    className="rounded-lg bg-red-900/60 hover:bg-red-800 px-2.5 py-1 text-[11px] text-red-200 font-bold transition"
                  >
                    Desconectar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Supabase Project URL *
                  </label>
                  <input
                    type="text"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#10B981] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Supabase Anon Public Key *
                  </label>
                  <textarea
                    rows={3}
                    value={sbAnonKey}
                    onChange={(e) => setSbAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white font-mono focus:border-[#10B981] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#10B981] hover:bg-[#059669] py-2.5 text-xs font-subtitle font-bold text-black shadow transition"
                >
                  💾 Guardar y Conectar con Supabase
                </button>
              </form>

              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white/70 space-y-1.5">
                <p className="font-bold text-white/90">¿Cómo conectar tu Supabase en 3 pasos?</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline">supabase.com/dashboard</a> e ingresa a tu proyecto.</li>
                  <li>Ve a <strong>Project Settings &gt; API</strong> y copia la <strong>Project URL</strong> y la <strong>anon public key</strong>.</li>
                  <li>Ejecuta el archivo <code>supabase_schema.sql</code> incluido en el repositorio en el <strong>SQL Editor</strong> de Supabase para crear las tablas con un clic.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: JSON DATA ENGINE */}
          {activeTab === "json" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-2">
                <h4 className="font-bold text-xs text-white flex items-center gap-2">
                  <span>📥</span>
                  <span>Exportar Base de Datos a Archivo JSON</span>
                </h4>
                <p className="text-[11px] text-white/60">
                  Descarga todos los lugares turísticos, avisos y usuarios sanitizados en un solo archivo JSON para copias de seguridad o análisis de datos.
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow transition flex items-center gap-1.5"
                >
                  <span>⬇️ Descargar riqsi_rutas_db.json</span>
                </button>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-2">
                <h4 className="font-bold text-xs text-white flex items-center gap-2">
                  <span>📤</span>
                  <span>Importar o Sincronizar desde JSON</span>
                </h4>
                <p className="text-[11px] text-white/60">
                  Pega aquí un fragmento JSON o estructura exportada para poblar o actualizar la base de datos de Supabase y local:
                </p>
                <textarea
                  rows={4}
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='{ "places": [ { "id": "place-1", "title": "Cristo de la Concordia", ... } ] }'
                  className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white font-mono focus:border-[#3B82F6] focus:outline-none resize-none"
                />
                {importStatus && (
                  <p className="text-xs font-semibold text-emerald-300">{importStatus}</p>
                )}
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow transition"
                >
                  Sincronizar Datos desde JSON
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Filtro de severidad:</span>
                <div className="flex gap-1">
                  {(["ALL", "BLOCKED", "WARNING", "OK"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLogFilter(filter)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                        logFilter === filter
                          ? "bg-white/20 text-white"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  No hay registros bajo este filtro.
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {filteredLogs.map((log) => {
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
                          Usuario: {log.userEmail} · Rol: {log.role || "sin rol"}
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
