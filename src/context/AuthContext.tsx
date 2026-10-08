import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Role } from "../types/auth";
import { INITIAL_USERS } from "../data/initialData";

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  previewAsNormal: boolean;
  setPreviewAsNormal: (val: boolean) => void;
  isEffectiveAdmin: boolean;
  login: (usernameOrEmail: string, password: string) => { success: boolean; message: string };
  register: (data: { name: string; username: string; email: string; password: string; role?: Role; avatar?: string }) => { success: boolean; message: string };
  logout: () => void;
  adminCreateUser: (data: { name: string; username: string; email: string; password: string; role: Role; avatar?: string }) => { success: boolean; message: string };
  adminUpdateUserRole: (userId: string, role: Role) => void;
  adminDeleteUser: (userId: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "riqsi_users_v1";
const SESSION_STORAGE_KEY = "riqsi_current_user_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading users from localStorage", e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading current session from localStorage", e);
    }
    return null;
  });

  const [previewAsNormal, setPreviewAsNormal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Error saving users to localStorage", e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error saving current user to localStorage", e);
    }
  }, [currentUser]);

  const login = (usernameOrEmail: string, password: string) => {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier) &&
        u.password === password
    );

    if (!user) {
      return { success: false, message: "Usuario o contraseña incorrectos." };
    }

    setCurrentUser(user);
    setPreviewAsNormal(false);
    return {
      success: true,
      message: user.role === "admin" ? `¡Bienvenido Administrador ${user.name}!` : `¡Bienvenido ${user.name}!`,
    };
  };

  const register = ({
    name,
    username,
    email,
    password,
    role = "normal",
    avatar = "🎒",
  }: {
    name: string;
    username: string;
    email: string;
    password: string;
    role?: Role;
    avatar?: string;
  }) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanUsername || !password.trim()) {
      return { success: false, message: "Por favor completa todos los campos requeridos." };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `El nombre de usuario "${username}" ya está registrado.` };
    }

    if (cleanEmail && users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `El correo "${email}" ya está registrado.` };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail || `${cleanUsername}@usuario.bo`,
      password: password.trim(),
      role,
      avatar: avatar || (role === "admin" ? "👑" : "🎒"),
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    setCurrentUser(newUser);
    setPreviewAsNormal(false);

    return {
      success: true,
      message: `¡Cuenta creada con éxito! Bienvenido ${newUser.name}.`,
    };
  };

  const logout = () => {
    setCurrentUser(null);
    setPreviewAsNormal(false);
  };

  const adminCreateUser = ({
    name,
    username,
    email,
    password,
    role,
    avatar,
  }: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: Role;
    avatar?: string;
  }) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanUsername || !password.trim()) {
      return { success: false, message: "Todos los campos son obligatorios." };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `El usuario "${username}" ya existe.` };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail || `${cleanUsername}@sistema.bo`,
      password: password.trim(),
      role,
      avatar: avatar || (role === "admin" ? "👑" : "🎒"),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers([newUser, ...users]);
    return { success: true, message: `Usuario ${newUser.username} (${role}) creado exitosamente.` };
  };

  const adminUpdateUserRole = (userId: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, role: newRole };
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const adminDeleteUser = (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      return { success: false, message: "No puedes eliminar tu propia cuenta en sesión activa." };
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return { success: true, message: "Usuario eliminado correctamente." };
  };

  const isEffectiveAdmin = currentUser?.role === "admin" && !previewAsNormal;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        previewAsNormal,
        setPreviewAsNormal,
        isEffectiveAdmin,
        login,
        register,
        logout,
        adminCreateUser,
        adminUpdateUserRole,
        adminDeleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
