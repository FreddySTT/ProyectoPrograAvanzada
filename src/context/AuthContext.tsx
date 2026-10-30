import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Role, SecurityLog } from "../types/auth";
import { INITIAL_USERS } from "../data/initialData";
import { isSupabaseConfigured } from "../supabase/config";
import {
  fetchUsers,
  saveUserToDatabase,
  updateUserRoleInDatabase,
  updateUserStatusInDatabase,
  resetUserPasswordInDatabase,
  deleteUserFromDatabase,
  logSecurityEvent,
  getStoredSecurityLogs,
} from "../supabase/services";
import {
  hashPassword,
  verifyPassword,
  verifyMasterAdminKey,
} from "../utils/security";
import {
  secureGet,
  secureSet,
  secureRemove,
  getStorageMode,
  setStorageMode,
  purgeAllStorage,
  type StorageMode,
} from "../utils/storage";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 60;
const SESSION_STORAGE_KEY = "riqsi_current_user_v2";

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  previewAsNormal: boolean;
  setPreviewAsNormal: (val: boolean) => void;
  isEffectiveAdmin: boolean;
  isEditorOrAdmin: boolean;
  isSupabaseLive: boolean;
  isLockedOut: boolean;
  lockoutRemaining: number;
  securityLogs: SecurityLog[];
  storageMode: StorageMode;
  toggleStorageMode: (mode: StorageMode) => void;
  purgeStorage: () => void;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { name: string; username: string; email: string; password: string; avatar?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  elevateToAdmin: (securityKey: string) => Promise<{ success: boolean; message: string }>;
  adminCreateUser: (data: { name: string; username: string; email: string; password: string; role: Role; avatar?: string }) => Promise<{ success: boolean; message: string }>;
  adminUpdateUserRole: (userId: string, role: Role) => Promise<void>;
  adminUpdateUserStatus: (userId: string, status: "active" | "suspended") => Promise<{ success: boolean; message: string }>;
  adminResetPassword: (userId: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  adminDeleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (usernameOrEmail: string, masterKey: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  verifyAdminSecurityKey: (key: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isSupabaseLive = isSupabaseConfigured();
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [storageMode, setStorageModeState] = useState<StorageMode>(getStorageMode());

  // Cargar sesión cifrada al montar
  useEffect(() => {
    secureGet<Omit<User, "passwordHash">>(SESSION_STORAGE_KEY).then((stored) => {
      if (stored) setCurrentUser(stored as User);
    });
  }, []);

  const [previewAsNormal, setPreviewAsNormal] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Sincronizar usuarios desde Supabase o almacenamiento seguro
  useEffect(() => {
    fetchUsers().then((loadedUsers) => {
      if (loadedUsers && loadedUsers.length > 0) {
        setUsers(loadedUsers);
      }
    });

    getStoredSecurityLogs().then((logs) => setSecurityLogs(logs));
  }, []);

  // Guardar sesión protegida
  useEffect(() => {
    if (currentUser) {
      const { passwordHash, ...safeUser } = currentUser;
      secureSet(SESSION_STORAGE_KEY, safeUser);
    } else {
      secureRemove(SESSION_STORAGE_KEY);
    }
  }, [currentUser]);

  // Temporizador de bloqueo por fuerza bruta
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const toggleStorageMode = (mode: StorageMode) => {
    setStorageMode(mode);
    setStorageModeState(mode);
    logSecurityEvent({
      event: "STORAGE_MODE_CHANGED",
      userEmail: currentUser?.email || "sistema",
      status: "OK",
      details: `Modo de almacenamiento actualizado a: ${mode === "memory-only" ? "Memoria Volátil (Zero-Storage)" : "Cifrado Militar AES-256"}`,
    });
  };

  const purgeStorage = () => {
    purgeAllStorage();
    setCurrentUser(null);
    logSecurityEvent({
      event: "PURGE_STORAGE",
      userEmail: currentUser?.email || "admin",
      status: "WARNING",
      details: "Purgado total del almacenamiento local ejecutado. Rastro eliminado.",
    });
  };

  const verifyAdminSecurityKey = async (key: string): Promise<boolean> => {
    return await verifyMasterAdminKey(key);
  };

  const login = async (usernameOrEmail: string, password: string) => {
    if (lockoutRemaining > 0) {
      return {
        success: false,
        message: `Acceso bloqueado por seguridad. Espera ${lockoutRemaining} segundos para volver a intentar.`,
      };
    }

    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();

    let userList = users;
    // Asegurar lista actualizada con hashes desde Supabase
    const foundInState = userList.find(
      (u) =>
        u.username.toLowerCase() === cleanIdentifier ||
        u.email.toLowerCase() === cleanIdentifier
    );

    if (!foundInState || !foundInState.passwordHash) {
      const freshUsers = await fetchUsers();
      if (freshUsers && freshUsers.length > 0) {
        userList = freshUsers;
        setUsers(freshUsers);
      }
    }

    const candidate = userList.find(
      (u) =>
        u.username.toLowerCase() === cleanIdentifier ||
        u.email.toLowerCase() === cleanIdentifier
    );

    // Validar si la cuenta está suspendida
    if (candidate && candidate.status === "suspended") {
      await logSecurityEvent({
        event: "LOGIN_FAILED",
        userEmail: cleanIdentifier,
        status: "BLOCKED",
        details: "Intento de inicio de sesión en cuenta suspendida",
      });
      return {
        success: false,
        message: "Esta cuenta está temporalmente suspendida por seguridad. Contacta al Administrador.",
      };
    }

    let passwordMatches = false;
    if (candidate && candidate.passwordHash) {
      passwordMatches = await verifyPassword(password, candidate.passwordHash);
    }

    if (!candidate || !passwordMatches) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      await logSecurityEvent({
        event: "LOGIN_FAILED",
        userEmail: cleanIdentifier,
        status: newAttempts >= MAX_FAILED_ATTEMPTS ? "BLOCKED" : "WARNING",
        details: `Intento de acceso fallido con clave incorrecta (${newAttempts}/${MAX_FAILED_ATTEMPTS})`,
      });

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutRemaining(LOCKOUT_DURATION_SECONDS);
        return {
          success: false,
          message: `Demasiados intentos fallidos. Bloqueado temporalmente por ${LOCKOUT_DURATION_SECONDS} segundos.`,
        };
      }

      return {
        success: false,
        message: `Credenciales inválidas. Intentos restantes: ${MAX_FAILED_ATTEMPTS - newAttempts}`,
      };
    }

    // Inicio exitoso
    const safeUser: User = {
      ...candidate,
      lastLogin: new Date().toISOString(),
    };

    setCurrentUser(safeUser);
    setPreviewAsNormal(false);
    setFailedAttempts(0);

    await logSecurityEvent({
      event: "LOGIN_SUCCESS",
      userEmail: candidate.email,
      role: candidate.role,
      status: "OK",
      details: `Sesión iniciada correctamente con autenticación SHA-256 (${candidate.role})`,
    });

    return {
      success: true,
      message:
        candidate.role === "admin"
          ? `¡Bienvenido Administrador ${candidate.name}!`
          : `¡Bienvenido a Riqsi Rutas, ${candidate.name}!`,
    };
  };

  const register = async ({
    name,
    username,
    email,
    password,
    avatar = "🎒",
  }: {
    name: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
  }) => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanUsername || !password.trim()) {
      return { success: false, message: "Todos los campos obligatorios deben completarse." };
    }

    if (password.length < 6) {
      return { success: false, message: "La contraseña debe tener al menos 6 caracteres." };
    }

    const usernameExists = users.some((u) => u.username.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return { success: false, message: `El nombre de usuario @${cleanUsername} ya está en uso.` };
    }

    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: `El correo ${cleanEmail} ya se encuentra registrado.` };
    }

    // Cifrar contraseña con SHA-256 + Salt
    const passwordHash = await hashPassword(password);

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role: "normal",
      status: "active",
      avatar,
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString(),
    };

    await saveUserToDatabase(newUser);
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    await logSecurityEvent({
      event: "USER_REGISTERED",
      userEmail: cleanEmail,
      role: "normal",
      status: "OK",
      details: `Nuevo usuario registrado con credenciales cifradas (@${cleanUsername})`,
    });

    return { success: true, message: `¡Registro exitoso! Bienvenido a Cochabamba, ${newUser.name}.` };
  };

  const logout = async () => {
    const emailBefore = currentUser?.email || "anon";
    setCurrentUser(null);
    setPreviewAsNormal(false);

    await logSecurityEvent({
      event: "LOGOUT",
      userEmail: emailBefore,
      status: "OK",
      details: "Cierre de sesión seguro finalizado",
    });
  };

  const elevateToAdmin = async (securityKey: string) => {
    if (!currentUser) {
      return { success: false, message: "Debes iniciar sesión primero." };
    }

    const isValid = await verifyMasterAdminKey(securityKey);
    if (!isValid) {
      await logSecurityEvent({
        event: "ADMIN_ELEVATION",
        userEmail: currentUser.email,
        status: "WARNING",
        details: "Intento fallido de elevación a Administrador (clave maestra incorrecta)",
      });
      return { success: false, message: "Clave Maestra incorrecta o no autorizada." };
    }

    await updateUserRoleInDatabase(currentUser.id, "admin");
    const updated = { ...currentUser, role: "admin" as Role };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

    await logSecurityEvent({
      event: "ADMIN_ELEVATION",
      userEmail: currentUser.email,
      role: "admin",
      status: "OK",
      details: "Usuario elevado exitosamente a Administrador mediante Clave Maestra",
    });

    return { success: true, message: "¡Privilegios de Administrador activados con éxito!" };
  };

  const adminCreateUser = async ({
    name,
    username,
    email,
    password,
    role,
    avatar = "🎒",
  }: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: Role;
    avatar?: string;
  }) => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanUsername || !password.trim()) {
      return { success: false, message: "Todos los campos requeridos deben completarse." };
    }

    if (password.length < 6) {
      return { success: false, message: "La contraseña debe tener al menos 6 caracteres." };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `El usuario @${cleanUsername} ya existe.` };
    }

    const passwordHash = await hashPassword(password);

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role,
      status: "active",
      avatar,
      createdAt: new Date().toISOString().split("T")[0],
    };

    await saveUserToDatabase(newUser);
    setUsers((prev) => [newUser, ...prev]);

    await logSecurityEvent({
      event: "ROLE_UPDATED",
      userEmail: cleanEmail,
      role,
      status: "OK",
      details: `Administrador creó usuario @${cleanUsername} con rol ${role}`,
    });

    return { success: true, message: `Usuario @${cleanUsername} creado exitosamente con rol ${role}.` };
  };

  const adminUpdateUserRole = async (userId: string, role: Role) => {
    await updateUserRoleInDatabase(userId, role);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role } : null));
    }

    await logSecurityEvent({
      event: "ROLE_UPDATED",
      userEmail: userId,
      role,
      status: "OK",
      details: `Rol de usuario ${userId} actualizado a ${role}`,
    });
  };

  const adminUpdateUserStatus = async (userId: string, status: "active" | "suspended") => {
    if (currentUser?.id === userId && status === "suspended") {
      return { success: false, message: "No puedes suspender tu propia cuenta activa." };
    }

    await updateUserStatusInDatabase(userId, status);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));

    await logSecurityEvent({
      event: status === "suspended" ? "USER_SUSPENDED" : "USER_ACTIVATED",
      userEmail: userId,
      status: status === "suspended" ? "WARNING" : "OK",
      details: `Estado de usuario ${userId} cambiado a: ${status}`,
    });

    return {
      success: true,
      message: `Usuario ${status === "suspended" ? "suspendido" : "reactivado"} con éxito.`,
    };
  };

  const adminResetPassword = async (userId: string, newPass: string) => {
    if (newPass.length < 6) {
      return { success: false, message: "La nueva clave debe tener al menos 6 caracteres." };
    }

    const newHash = await hashPassword(newPass);
    await resetUserPasswordInDatabase(userId, newHash);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, passwordHash: newHash } : u)));

    await logSecurityEvent({
      event: "PASSWORD_RESET",
      userEmail: userId,
      status: "WARNING",
      details: `Contraseña de usuario ${userId} restablecida por Administrador`,
    });

    return { success: true, message: "Contraseña actualizada exitosamente." };
  };

  const requestPasswordReset = async (
    usernameOrEmail: string,
    masterKey: string,
    newPass: string
  ) => {
    const isMasterValid = await verifyMasterAdminKey(masterKey);
    if (!isMasterValid) {
      return { success: false, message: "Clave de Autorización Maestra incorrecta." };
    }

    if (newPass.length < 6) {
      return { success: false, message: "La nueva clave debe tener al menos 6 caracteres." };
    }

    const clean = usernameOrEmail.trim().toLowerCase();
    const target = users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!target) {
      return { success: false, message: "No se encontró ningún usuario con ese correo o usuario." };
    }

    const newHash = await hashPassword(newPass);
    await resetUserPasswordInDatabase(target.id, newHash);
    setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, passwordHash: newHash } : u)));

    await logSecurityEvent({
      event: "PASSWORD_RESET",
      userEmail: target.email,
      status: "WARNING",
      details: `Contraseña restablecida de emergencia con Clave Maestra para ${target.username}`,
    });

    return { success: true, message: `Contraseña restablecida con éxito para @${target.username}. Ya puedes iniciar sesión.` };
  };

  const adminDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
      return { success: false, message: "No puedes eliminar tu propia cuenta en sesión activa." };
    }

    await deleteUserFromDatabase(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    await logSecurityEvent({
      event: "ROLE_UPDATED",
      userEmail: userId,
      status: "WARNING",
      details: `Usuario ${userId} eliminado del sistema por el Administrador`,
    });

    return { success: true, message: "Usuario eliminado correctamente del sistema." };
  };

  const isEffectiveAdmin = currentUser?.role === "admin" && !previewAsNormal;
  const isEditorOrAdmin = (currentUser?.role === "admin" || currentUser?.role === "editor") && !previewAsNormal;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        previewAsNormal,
        setPreviewAsNormal,
        isEffectiveAdmin,
        isEditorOrAdmin,
        isSupabaseLive,
        isLockedOut: lockoutRemaining > 0,
        lockoutRemaining,
        securityLogs,
        storageMode,
        toggleStorageMode,
        purgeStorage,
        login,
        register,
        logout,
        elevateToAdmin,
        adminCreateUser,
        adminUpdateUserRole,
        adminUpdateUserStatus,
        adminResetPassword,
        adminDeleteUser,
        requestPasswordReset,
        verifyAdminSecurityKey,
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
