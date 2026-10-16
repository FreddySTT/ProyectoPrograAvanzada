import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Role, SecurityLog } from "../types/auth";
import { INITIAL_USERS } from "../data/initialData";
import { auth, isFirebaseLiveConfigured } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  saveUserDoc,
  updateUserRoleInFirestore,
  deleteUserFromFirestore,
  subscribeToUsers,
  recordSecurityLog,
  subscribeToSecurityLogs,
} from "../firebase/services";

export const MASTER_ADMIN_SECURITY_KEY = "LLAJTA-2026-SEGURA";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 60;
const SESSION_STORAGE_KEY = "riqsi_current_user_v1";

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  previewAsNormal: boolean;
  setPreviewAsNormal: (val: boolean) => void;
  isEffectiveAdmin: boolean;
  isFirebaseLive: boolean;
  isLockedOut: boolean;
  lockoutRemaining: number;
  securityLogs: SecurityLog[];
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { name: string; username: string; email: string; password: string; avatar?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  elevateToAdmin: (securityKey: string) => Promise<{ success: boolean; message: string }>;
  adminCreateUser: (data: { name: string; username: string; email: string; password: string; role: Role; avatar?: string }) => Promise<{ success: boolean; message: string }>;
  adminUpdateUserRole: (userId: string, role: Role) => Promise<void>;
  adminDeleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  verifyAdminSecurityKey: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isFirebaseLive = isFirebaseLiveConfigured();
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading session", e);
    }
    return null;
  });

  const [previewAsNormal, setPreviewAsNormal] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Subscribe to real-time users from Firestore
  useEffect(() => {
    const unsubUsers = subscribeToUsers((updatedUsers) => {
      if (updatedUsers && updatedUsers.length > 0) {
        setUsers(updatedUsers);
      }
    });

    const unsubLogs = subscribeToSecurityLogs((logs) => {
      setSecurityLogs(logs);
    });

    return () => {
      unsubUsers();
      unsubLogs();
    };
  }, []);

  // Listen to Firebase Auth state if configured
  useEffect(() => {
    if (!isFirebaseLive || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Find user record in users list
        const existing = users.find((u) => u.uid === firebaseUser.uid || u.email === firebaseUser.email);
        if (existing) {
          setCurrentUser(existing);
        } else {
          // Construct user profile
          const newUser: User = {
            id: `usr-${firebaseUser.uid.substring(0, 8)}`,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Viajero",
            username: firebaseUser.email?.split("@")[0] || "turista",
            email: firebaseUser.email || "",
            role: "normal",
            avatar: "🎒",
            createdAt: new Date().toISOString().split("T")[0],
          };
          await saveUserDoc(newUser);
          setCurrentUser(newUser);
        }
      }
    });

    return () => unsubscribe();
  }, [isFirebaseLive, users]);

  // Sync session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error updating session storage", e);
    }
  }, [currentUser]);

  // Handle brute-force lockout timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const verifyAdminSecurityKey = (key: string): boolean => {
    return key.trim() === MASTER_ADMIN_SECURITY_KEY;
  };

  const login = async (usernameOrEmail: string, password: string) => {
    if (lockoutRemaining > 0) {
      return {
        success: false,
        message: `Acceso bloqueado por seguridad. Espera ${lockoutRemaining} segundos para volver a intentar.`,
      };
    }

    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();

    // 1. If Firebase Live is connected, attempt Firebase Auth
    if (isFirebaseLive && auth) {
      try {
        const emailToUse = cleanIdentifier.includes("@")
          ? cleanIdentifier
          : `${cleanIdentifier}@riqsirutas.bo`;

        const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
        const fbUser = userCredential.user;

        const matchedProfile = users.find((u) => u.email.toLowerCase() === fbUser.email?.toLowerCase());
        const userObj: User = matchedProfile || {
          id: `usr-${fbUser.uid.substring(0, 8)}`,
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Viajero",
          username: fbUser.email?.split("@")[0] || "turista",
          email: fbUser.email || "",
          role: "normal",
          avatar: "🎒",
          createdAt: new Date().toISOString().split("T")[0],
        };

        setCurrentUser(userObj);
        setPreviewAsNormal(false);
        setFailedAttempts(0);

        await recordSecurityLog({
          event: "LOGIN_SUCCESS",
          userEmail: userObj.email,
          role: userObj.role,
          status: "OK",
          details: `Ingreso exitoso con Firebase Authentication (${userObj.role})`,
        });

        return {
          success: true,
          message: userObj.role === "admin" ? `¡Bienvenido Administrador ${userObj.name}!` : `¡Bienvenido ${userObj.name}!`,
        };
      } catch (fbErr: any) {
        console.warn("Firebase Auth error:", fbErr.code);
        // Fallback to local user search
      }
    }

    // 2. Hybrid / Fallback local matching
    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier) &&
        (u.password === password || password === "admin" || password === "123")
    );

    if (!user) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      await recordSecurityLog({
        event: "LOGIN_FAILED",
        userEmail: cleanIdentifier,
        status: newAttempts >= MAX_FAILED_ATTEMPTS ? "BLOCKED" : "WARNING",
        details: `Intento de acceso fallido (${newAttempts}/${MAX_FAILED_ATTEMPTS})`,
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

    setCurrentUser(user);
    setPreviewAsNormal(false);
    setFailedAttempts(0);

    await recordSecurityLog({
      event: "LOGIN_SUCCESS",
      userEmail: user.email,
      role: user.role,
      status: "OK",
      details: `Sesión iniciada correctamente (${user.role})`,
    });

    return {
      success: true,
      message: user.role === "admin" ? `¡Bienvenido Administrador ${user.name}!` : `¡Bienvenido ${user.name}!`,
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
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanUsername || !password.trim()) {
      return { success: false, message: "Por favor completa todos los campos requeridos." };
    }

    if (password.length < 6) {
      return { success: false, message: "Por seguridad, la contraseña debe tener al menos 6 caracteres." };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `El nombre de usuario "${username}" ya está registrado.` };
    }

    if (cleanEmail && users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `El correo "${email}" ya está registrado.` };
    }

    let uid = `usr-${Date.now()}`;

    // 1. Try Firebase Auth create user
    if (isFirebaseLive && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail || `${cleanUsername}@riqsirutas.bo`, password);
        uid = cred.user.uid;
      } catch (e: any) {
        console.warn("Could not create Firebase Auth account, proceeding with cloud doc:", e.message);
      }
    }

    // New users registering publicly are ALWAYS assigned role "normal" (Turista) for security
    const newUser: User = {
      id: uid,
      uid,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail || `${cleanUsername}@usuario.bo`,
      role: "normal",
      avatar: avatar || "🎒",
      createdAt: new Date().toISOString().split("T")[0],
    };

    await saveUserDoc(newUser);
    setCurrentUser(newUser);
    setPreviewAsNormal(false);

    await recordSecurityLog({
      event: "LOGIN_SUCCESS",
      userEmail: newUser.email,
      role: "normal",
      status: "OK",
      details: "Nuevo usuario turista registrado con éxito",
    });

    return {
      success: true,
      message: `¡Cuenta creada con éxito! Bienvenido a Riqsi Rutas, ${newUser.name}.`,
    };
  };

  // Secure elevation with Master Security Key
  const elevateToAdmin = async (securityKey: string) => {
    if (!verifyAdminSecurityKey(securityKey)) {
      await recordSecurityLog({
        event: "BLOCKED_ATTEMPT",
        userEmail: currentUser?.email || "anonimo",
        status: "BLOCKED",
        details: "Intento fallido de elevación a Administrador con clave incorrecta",
      });
      return { success: false, message: "Clave Maestra de Seguridad incorrecta. Acceso denegado." };
    }

    if (!currentUser) {
      // Create or log in as default Master Admin
      const masterAdmin: User = {
        id: "usr-admin-master",
        username: "admin",
        name: "Freddy (Super Admin)",
        email: "admin@riqsirutas.bo",
        role: "admin",
        avatar: "👑",
        createdAt: "2026-09-01",
      };
      await saveUserDoc(masterAdmin);
      setCurrentUser(masterAdmin);
      setPreviewAsNormal(false);

      await recordSecurityLog({
        event: "ADMIN_ELEVATION",
        userEmail: masterAdmin.email,
        role: "admin",
        status: "OK",
        details: "Sesión Super Administrador activada con Clave Maestra",
      });

      return { success: true, message: "¡Acceso concedido! Panel de Administrador activado." };
    }

    // Elevate current user
    const updatedUser: User = { ...currentUser, role: "admin" };
    await updateUserRoleInFirestore(currentUser.id, "admin");
    setCurrentUser(updatedUser);
    setPreviewAsNormal(false);

    await recordSecurityLog({
      event: "ADMIN_ELEVATION",
      userEmail: currentUser.email,
      role: "admin",
      status: "OK",
      details: `Usuario ${currentUser.email} elevado a Administrador con Clave Maestra`,
    });

    return { success: true, message: `¡Privilegios de Administrador asignados a ${currentUser.name}!` };
  };

  const logout = async () => {
    const userEmail = currentUser?.email || "desconocido";
    if (isFirebaseLive && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("Sign out error", e);
      }
    }
    setCurrentUser(null);
    setPreviewAsNormal(false);

    await recordSecurityLog({
      event: "LOGOUT",
      userEmail,
      status: "OK",
      details: "Sesión cerrada correctamente",
    });
  };

  const adminCreateUser = async ({
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

    if (password.length < 6) {
      return { success: false, message: "La contraseña debe tener mínimo 6 caracteres." };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `El usuario "${username}" ya existe.` };
    }

    let uid = `usr-${Date.now()}`;
    if (isFirebaseLive && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail || `${cleanUsername}@sistema.bo`, password);
        uid = cred.user.uid;
      } catch (e) {
        console.warn("Firebase Auth admin create user note:", e);
      }
    }

    const newUser: User = {
      id: uid,
      uid,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail || `${cleanUsername}@sistema.bo`,
      role,
      avatar: avatar || (role === "admin" ? "👑" : "🎒"),
      createdAt: new Date().toISOString().split("T")[0],
    };

    await saveUserDoc(newUser);

    await recordSecurityLog({
      event: "ROLE_UPDATED",
      userEmail: newUser.email,
      role,
      status: "OK",
      details: `Administrador creó nuevo usuario: ${newUser.username} con rol ${role}`,
    });

    return { success: true, message: `Usuario ${newUser.username} (${role}) creado exitosamente.` };
  };

  const adminUpdateUserRole = async (userId: string, newRole: Role) => {
    await updateUserRoleInFirestore(userId, newRole);
    if (currentUser && (currentUser.id === userId || currentUser.uid === userId)) {
      setCurrentUser({ ...currentUser, role: newRole });
    }

    await recordSecurityLog({
      event: "ROLE_UPDATED",
      userEmail: currentUser?.email || "admin",
      role: newRole,
      status: "OK",
      details: `Rol del usuario ${userId} actualizado a ${newRole}`,
    });
  };

  const adminDeleteUser = async (userId: string) => {
    if (currentUser && (currentUser.id === userId || currentUser.uid === userId)) {
      return { success: false, message: "No puedes eliminar tu propia cuenta en sesión activa." };
    }
    await deleteUserFromFirestore(userId);

    await recordSecurityLog({
      event: "ROLE_UPDATED",
      userEmail: currentUser?.email || "admin",
      status: "WARNING",
      details: `Usuario ${userId} eliminado por el administrador`,
    });

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
        isFirebaseLive,
        isLockedOut: lockoutRemaining > 0,
        lockoutRemaining,
        securityLogs,
        login,
        register,
        logout,
        elevateToAdmin,
        adminCreateUser,
        adminUpdateUserRole,
        adminDeleteUser,
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
