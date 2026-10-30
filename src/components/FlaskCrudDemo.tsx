import { useState, useEffect, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  creado_en: string;
}
interface FormData { nombre: string; email: string; telefono: string; }
const EMPTY_FORM: FormData = { nombre: "", email: "", telefono: "" };
const API = "http://localhost:5050/api";

// ─── Componente principal ─────────────────────────────────────────────────────
export function FlaskCrudDemo() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverUp, setServerUp] = useState<boolean | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── Notificaciones temporales ───────────────────────────────────────────────
  const notify = (msg: string, type: "ok" | "err") => {
    if (type === "ok") { setSuccess(msg); setTimeout(() => setSuccess(null), 3500); }
    else { setError(msg); setTimeout(() => setError(null), 4000); }
  };

  // ── Cargar usuarios ─────────────────────────────────────────────────────────
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsuarios(data.data ?? []);
      setServerUp(true);
    } catch {
      setServerUp(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  // ── Guardar (crear o actualizar) ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || !form.email.trim() || !form.telefono.trim()) {
      notify("Todos los campos son obligatorios.", "err");
      return;
    }
    try {
      const url = editingId ? `${API}/users/${editingId}` : `${API}/users`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { notify(data.error ?? "Error al guardar", "err"); return; }
      notify(data.mensaje ?? "Guardado correctamente", "ok");
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchUsuarios();
    } catch {
      notify("No se pudo conectar con el servidor Flask.", "err");
    }
  };

  // ── Editar ──────────────────────────────────────────────────────────────────
  const startEdit = (u: Usuario) => {
    setEditingId(u.id);
    setForm({ nombre: u.nombre, email: u.email, telefono: u.telefono });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Eliminar ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { notify(data.error ?? "Error al eliminar", "err"); return; }
      notify(data.mensaje ?? "Usuario eliminado", "ok");
      setConfirmDelete(null);
      fetchUsuarios();
    } catch {
      notify("No se pudo conectar con el servidor Flask.", "err");
    }
  };

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_FORM); setError(null); };

  // ─── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: "100vh", background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", color: "#e2e8f0", padding: "2rem 1rem" }}>
      
      {/* Header */}
      <div style={{ maxWidth: 860, margin: "0 auto 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#4ade80,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐍</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, background: "linear-gradient(90deg,#4ade80,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Flask CRUD API
            </h1>
            <p style={{ margin: 0, fontSize: ".8rem", color: "#94a3b8" }}>Python + Flask · Almacenamiento en memoria · REST</p>
          </div>
        </div>

        {/* Estado del servidor */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: serverUp === null ? "#334155" : serverUp ? "rgba(74,222,128,.15)" : "rgba(248,113,113,.15)", border: `1px solid ${serverUp === null ? "#475569" : serverUp ? "#4ade80" : "#f87171"}`, fontSize: ".8rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: serverUp === null ? "#94a3b8" : serverUp ? "#4ade80" : "#f87171", display: "inline-block", animation: serverUp ? "pulse 2s infinite" : "none" }} />
          {serverUp === null ? "Comprobando servidor…" : serverUp ? "Servidor Flask corriendo en localhost:5000" : "⚠️ Servidor Flask apagado — ejecuta iniciar-flask-crud.bat"}
        </div>
      </div>

      {/* Notificaciones */}
      {(success || error) && (
        <div style={{ maxWidth: 860, margin: "0 auto 1rem" }}>
          <div style={{ padding: "10px 16px", borderRadius: 8, background: success ? "rgba(74,222,128,.2)" : "rgba(248,113,113,.2)", border: `1px solid ${success ? "#4ade80" : "#f87171"}`, color: success ? "#4ade80" : "#fca5a5", fontSize: ".9rem" }}>
            {success || error}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Formulario */}
        <div style={{ background: "rgba(255,255,255,.05)", backdropFilter: "blur(12px)", borderRadius: 16, border: "1px solid rgba(255,255,255,.1)", padding: "1.5rem" }}>
          <h2 style={{ margin: "0 0 1.2rem", fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
            {editingId ? "✏️ Editar usuario" : "➕ Nuevo usuario"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(["nombre", "email", "telefono"] as const).map(field => (
              <div key={field}>
                <label style={{ display: "block", fontSize: ".78rem", color: "#94a3b8", marginBottom: 4, textTransform: "capitalize" }}>{field}</label>
                <input
                  type={field === "email" ? "email" : "text"}
                  placeholder={field === "nombre" ? "Ana García" : field === "email" ? "ana@example.com" : "+591 712 34567"}
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "#f1f5f9", fontSize: ".9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: 8, background: "linear-gradient(135deg,#4ade80,#22d3ee)", border: "none", color: "#0f172a", fontWeight: 700, fontSize: ".9rem", cursor: "pointer" }}>
                {editingId ? "Actualizar" : "Crear usuario"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "#94a3b8", fontSize: ".85rem", cursor: "pointer" }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Endpoints documentados */}
          <div style={{ marginTop: "1.5rem", background: "rgba(0,0,0,.3)", borderRadius: 10, padding: "1rem" }}>
            <p style={{ margin: "0 0 .6rem", fontSize: ".75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Endpoints REST</p>
            {[
              ["GET", "/api/users", "#22d3ee"],
              ["POST", "/api/users", "#4ade80"],
              ["GET", "/api/users/:id", "#22d3ee"],
              ["PUT", "/api/users/:id", "#fbbf24"],
              ["DELETE", "/api/users/:id", "#f87171"],
            ].map(([m, url, c]) => (
              <div key={url + m} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: ".7rem", fontWeight: 700, color: c, width: 52, fontFamily: "monospace" }}>{m}</span>
                <span style={{ fontSize: ".75rem", color: "#94a3b8", fontFamily: "monospace" }}>{url}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de usuarios */}
        <div style={{ background: "rgba(255,255,255,.05)", backdropFilter: "blur(12px)", borderRadius: 16, border: "1px solid rgba(255,255,255,.1)", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>
              👤 Usuarios <span style={{ fontSize: ".8rem", color: "#64748b" }}>({usuarios.length})</span>
            </h2>
            <button onClick={fetchUsuarios} disabled={loading} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "#94a3b8", fontSize: ".8rem", cursor: "pointer" }}>
              {loading ? "…" : "↻ Refrescar"}
            </button>
          </div>

          {!serverUp && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b", fontSize: ".9rem" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔌</div>
              <p style={{ margin: 0 }}>Inicia el servidor Flask para ver los datos</p>
              <code style={{ fontSize: ".75rem", color: "#4ade80" }}>python flask-crud/app.py</code>
            </div>
          )}

          {serverUp && usuarios.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              <div style={{ fontSize: 32 }}>📭</div>
              <p style={{ margin: 0, fontSize: ".9rem" }}>Sin usuarios todavía</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {usuarios.map(u => (
              <div key={u.id} style={{ background: "rgba(255,255,255,.06)", borderRadius: 10, padding: "12px", border: `1px solid ${editingId === u.id ? "#4ade80" : "rgba(255,255,255,.08)"}` }}>
                {confirmDelete === u.id ? (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 10px", fontSize: ".85rem", color: "#fca5a5" }}>¿Eliminar a {u.nombre}?</p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button onClick={() => handleDelete(u.id)} style={{ padding: "6px 14px", borderRadius: 6, background: "#ef4444", border: "none", color: "#fff", fontSize: ".8rem", cursor: "pointer" }}>Sí, eliminar</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(255,255,255,.1)", border: "none", color: "#94a3b8", fontSize: ".8rem", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: ".9rem", color: "#f1f5f9" }}>{u.nombre}</p>
                        <p style={{ margin: "0 0 2px", fontSize: ".78rem", color: "#94a3b8" }}>{u.email}</p>
                        <p style={{ margin: 0, fontSize: ".78rem", color: "#64748b" }}>{u.telefono}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => startEdit(u)} title="Editar" style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(251,191,36,.15)", border: "1px solid rgba(251,191,36,.3)", color: "#fbbf24", fontSize: ".8rem", cursor: "pointer" }}>✏️</button>
                        <button onClick={() => setConfirmDelete(u.id)} title="Eliminar" style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(248,113,113,.15)", border: "1px solid rgba(248,113,113,.3)", color: "#f87171", fontSize: ".8rem", cursor: "pointer" }}>🗑</button>
                      </div>
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: ".68rem", color: "#334155", fontFamily: "monospace" }}>id: {u.id.slice(0, 18)}…</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
