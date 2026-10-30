import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export function AdminUsersModal({ isOpen, onClose, onNotify }: AdminUsersModalProps) {
  const {
    users,
    currentUser,
    adminCreateUser,
    adminUpdateUserRole,
    adminUpdateUserStatus,
    adminResetPassword,
    adminDeleteUser,
  } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  // Create user form
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("normal");
  const [avatar, setAvatar] = useState("🎒");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setShowCreateForm(false);
      setFormError("");
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    setLoadingAction(true);
    try {
      const res = await adminCreateUser({
        name,
        username,
        email,
        password,
        role,
        avatar,
      });

      if (res.success) {
        if (onNotify) onNotify(res.message);
        setName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setShowCreateForm(false);
      } else {
        setFormError(res.message);
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetPasswordPrompt = async (userId: string, targetName: string) => {
    const newPass = prompt(`Introduce la nueva contraseña para ${targetName} (mínimo 6 caracteres):`);
    if (!newPass) return;
    if (newPass.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const res = await adminResetPassword(userId, newPass);
    if (onNotify) onNotify(res.message);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl border border-[#E2D9CC] flex flex-col max-h-[90vh]">
        {/* Top aguayo strip */}
        <div className="aguayo-strip h-2 w-full" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#E8E3D8] bg-[#FAF7F2] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <h2 className="font-subtitle text-xl font-extrabold text-[#37474F]">
                Gestión de Usuarios & Seguridad Supabase
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#6D4C41]">
              Administra roles (Admin, Editor, Turista), suspende cuentas y resetea contraseñas con cifrado SHA-256.
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

        {/* Search bar & Create button */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E8E3D8] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6D4C41]">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, usuario o correo..."
              className="w-full rounded-xl border border-[#E2D9CC] bg-white pl-9 pr-3.5 py-2 text-xs text-[#37474F] focus:border-[#D81B60] focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#D81B60] px-4 py-2 text-xs font-subtitle font-extrabold text-white shadow hover:bg-[#b0144c] transition"
          >
            <span>{showCreateForm ? "✕ Cancelar" : "➕ Crear Nuevo Usuario"}</span>
          </button>
        </div>

        {/* Create User Form Drawer */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-5 bg-[#FFF8EE] border-b border-[#FDE68A] space-y-3 animate-in slide-in-from-top-2 duration-150"
          >
            <p className="font-subtitle text-xs font-black uppercase text-[#B45309]">
              Nuevo Usuario para la Base de Datos
            </p>

            {formError && (
              <div className="rounded-lg bg-[#FFF1F2] border border-[#FECDD3] p-2 text-xs text-[#BE123C] font-bold">
                ⚠️ {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Laura Sánchez"
                  required
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Nombre de Usuario *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. laura_guia"
                  required
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="laura@cochabamba.bo"
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Contraseña Inicial (mínimo 6) *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Rol de Acceso</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                >
                  <option value="normal">Normal (Turista / Visitante)</option>
                  <option value="editor">Editor (Gestor de Contenido)</option>
                  <option value="admin">Administrador (Control total)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Avatar</label>
                <select
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                >
                  <option value="🎒">🎒 Turista</option>
                  <option value="👑">👑 Corona Admin</option>
                  <option value="📝">📝 Editor</option>
                  <option value="🌸">🌸 Flor del Valle</option>
                  <option value="🏔️">🏔️ Tunari</option>
                  <option value="🦅">🦅 Cóndor</option>
                  <option value="🥟">🥟 Salteña</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={loadingAction}
                className="rounded-lg bg-[#4CAF50] px-4 py-1.5 text-xs font-subtitle font-extrabold text-white shadow hover:bg-[#388E3C] transition disabled:opacity-50"
              >
                {loadingAction ? "Guardando..." : "Guardar Usuario en el Sistema"}
              </button>
            </div>
          </form>
        )}

        {/* Users List */}
        <div className="overflow-y-auto p-4 flex-1 divide-y divide-[#E8E3D8]">
          {filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-xs text-[#6D4C41]">
              No se encontraron usuarios coincidentes.
            </p>
          ) : (
            filteredUsers.map((u) => {
              const isMe = currentUser?.id === u.id || (currentUser?.uid && currentUser?.uid === u.uid);
              const isAdmin = u.role === "admin";
              const isEditor = u.role === "editor";
              const isSuspended = u.status === "suspended";

              return (
                <div
                  key={u.id || u.uid}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2] px-3 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-white shadow-xs border border-[#E2D9CC] grid place-items-center text-xl shrink-0">
                      {u.avatar || (isAdmin ? "👑" : isEditor ? "📝" : "🎒")}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-subtitle text-sm font-bold text-[#37474F]">
                          {u.name}
                        </span>
                        {isMe && (
                          <span className="rounded-full bg-[#D81B60]/10 px-2 py-0.5 text-[10px] font-bold text-[#D81B60]">
                            Tú
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-subtitle font-bold ${
                            isAdmin
                              ? "bg-[#1E293B] text-[#F4C430]"
                              : isEditor
                              ? "bg-purple-100 text-purple-700"
                              : "bg-[#E0F2FE] text-[#0369A1]"
                          }`}
                        >
                          {isAdmin ? "👑 Administrador" : isEditor ? "📝 Editor" : "🎒 Turista"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${
                            isSuspended
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isSuspended ? "Suspendido" : "Activo"}
                        </span>
                      </div>
                      <p className="text-xs text-[#6D4C41]">
                        @{u.username} · {u.email} · Registrado: {u.createdAt || "2026"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                    {/* Role changer dropdown */}
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        const newRole = e.target.value as Role;
                        await adminUpdateUserRole(u.id, newRole);
                        if (onNotify) {
                          onNotify(`Rol de @${u.username} actualizado a ${newRole}.`);
                        }
                      }}
                      className="rounded-lg border border-[#E2D9CC] bg-white px-2 py-1 text-[11px] font-subtitle font-bold text-[#37474F] hover:border-[#D81B60] transition"
                    >
                      <option value="normal">Turista</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* Suspend / Activate toggle */}
                    {!isMe && (
                      <button
                        onClick={async () => {
                          const newStatus = isSuspended ? "active" : "suspended";
                          const res = await adminUpdateUserStatus(u.id, newStatus);
                          if (onNotify) onNotify(res.message);
                        }}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                          isSuspended
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                        title={isSuspended ? "Reactivar cuenta" : "Suspender cuenta"}
                      >
                        {isSuspended ? "Reactivar" : "Suspender"}
                      </button>
                    )}

                    {/* Reset password button */}
                    <button
                      onClick={() => handleResetPasswordPrompt(u.id, u.name)}
                      className="rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 text-[11px] font-bold transition"
                      title="Restablecer contraseña"
                    >
                      🔑 Reset
                    </button>

                    {/* Delete button (cannot delete yourself) */}
                    {!isMe && (
                      <button
                        onClick={async () => {
                          if (confirm(`¿Eliminar permanentemente al usuario @${u.username}?`)) {
                            const res = await adminDeleteUser(u.id);
                            if (onNotify) onNotify(res.message);
                          }
                        }}
                        className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 text-xs font-bold transition"
                        title="Eliminar usuario"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E3D8] bg-[#FAF7F2] flex items-center justify-between text-xs text-[#6D4C41]">
          <span>
            Total de usuarios: <strong>{users.length}</strong> (Admins: {users.filter(u => u.role === "admin").length}, Editores: {users.filter(u => u.role === "editor").length})
          </span>
          <button
            onClick={onClose}
            className="rounded-full bg-[#1E293B] text-white px-5 py-2 font-subtitle font-bold hover:bg-[#334155] transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
