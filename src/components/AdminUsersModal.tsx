import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export function AdminUsersModal({ isOpen, onClose, onNotify }: AdminUsersModalProps) {
  const { users, currentUser, adminCreateUser, adminUpdateUserRole, adminDeleteUser } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const res = adminCreateUser({
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
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl border border-[#E2D9CC] flex flex-col max-h-[90vh]">
        {/* Top aguayo strip */}
        <div className="aguayo-strip h-2 w-full" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#E8E3D8] bg-[#FAF7F2] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <h2 className="font-subtitle text-xl font-extrabold text-[#37474F]">
                Gestión de Usuarios de la Plataforma
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#6D4C41]">
              Crea usuarios, asigna roles de Administrador o Turista Normal y supervisa el acceso.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#6D4C41] hover:bg-[#D81B60] hover:text-white transition shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#E8E3D8] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Buscar por nombre, usuario o email..."
            className="w-full sm:w-72 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] px-3.5 py-2 text-xs text-[#37474F] focus:border-[#D81B60] focus:bg-white focus:outline-none"
          />

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D81B60] px-4 py-2 text-xs font-subtitle font-bold text-white shadow-sm hover:bg-[#b0144c] transition"
          >
            <span>{showCreateForm ? "✕ Cancelar Formulario" : "➕ Crear Nuevo Usuario"}</span>
          </button>
        </div>

        {/* Create User Collapsible Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateSubmit} className="p-5 bg-[#FFF8EE] border-b border-[#FDE68A] space-y-3">
            <h3 className="font-subtitle text-sm font-extrabold text-[#B45309]">
              Formulario de Creación de Usuario (Admin)
            </h3>

            {formError && (
              <div className="rounded-lg bg-[#FFF1F2] border border-[#FECDD3] p-2 text-xs font-bold text-[#BE123C]">
                ⚠️ {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Ana Gómez"
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Nombre de Usuario *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. anagomez"
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ana@correo.com"
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Contraseña *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs focus:border-[#D81B60] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-subtitle font-bold text-[#37474F] mb-1">Rol de Usuario</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const r = e.target.value as Role;
                    setRole(r);
                    if (r === "admin") setAvatar("👑");
                    else setAvatar("🎒");
                  }}
                  className="w-full rounded-lg border border-[#E2D9CC] bg-white px-3 py-1.5 text-xs font-subtitle font-bold focus:border-[#D81B60] focus:outline-none"
                >
                  <option value="normal">Normal (Turista / Visitante)</option>
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
                  <option value="🌸">🌸 Flor del Valle</option>
                  <option value="🏔️">🏔️ Tunari</option>
                  <option value="🦅">🦅 Cóndor</option>
                  <option value="🚲">🚲 Bici</option>
                  <option value="🥟">🥟 Salteña/Empanada</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-[#4CAF50] px-4 py-1.5 text-xs font-subtitle font-extrabold text-white shadow hover:bg-[#388E3C] transition"
              >
                Guardar Usuario en el Sistema
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
              const isMe = currentUser?.id === u.id;
              const isAdmin = u.role === "admin";

              return (
                <div
                  key={u.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2] px-3 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-white shadow-xs border border-[#E2D9CC] grid place-items-center text-xl shrink-0">
                      {u.avatar || (isAdmin ? "👑" : "🎒")}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
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
                              : "bg-[#E0F2FE] text-[#0369A1]"
                          }`}
                        >
                          {isAdmin ? "👑 Administrador" : "🎒 Normal / Turista"}
                        </span>
                      </div>
                      <p className="text-xs text-[#6D4C41]">
                        @{u.username} · {u.email} · Registrado: {u.createdAt || "2026"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Switch role button */}
                    <button
                      onClick={() => {
                        const newRole = isAdmin ? "normal" : "admin";
                        adminUpdateUserRole(u.id, newRole);
                        if (onNotify) {
                          onNotify(`Rol de @${u.username} actualizado a ${newRole === "admin" ? "Administrador" : "Turista Normal"}`);
                        }
                      }}
                      className="rounded-lg border border-[#E2D9CC] bg-white px-2.5 py-1 text-[11px] font-subtitle font-bold text-[#37474F] hover:border-[#D81B60] hover:text-[#D81B60] transition"
                      title="Cambiar entre Administrador y Normal"
                    >
                      {isAdmin ? "Degradar a Normal" : "Ascender a Admin"}
                    </button>

                    {/* Delete button (cannot delete yourself) */}
                    {!isMe && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al usuario @${u.username}?`)) {
                            const res = adminDeleteUser(u.id);
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
          <span>Total de usuarios: <strong>{users.length}</strong> (Admins: {users.filter(u => u.role === "admin").length})</span>
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
