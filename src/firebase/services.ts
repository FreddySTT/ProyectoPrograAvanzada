// ==============================================================================
// Firebase Auth Services — Riqsi Rutas
// Adapta las operaciones de autenticación de Firebase Auth al mismo contrato
// que usa el AuthContext de Supabase, para el switch de backend.
// ==============================================================================
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as rtdbRef, set as rtdbSet, onValue as rtdbOnValue, push as rtdbPush } from "firebase/database";
import type { User } from "../types/auth";
import {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseStorage,
  getFirebaseRtdb,
  isFirebaseConfigured,
  trackFirebaseEvent,
} from "./config";

// ─── Tipos compatibles con el AuthContext existente ───────────────────────────
export interface FirebaseLoginResult {
  success: boolean;
  message: string;
  uid?: string;
  email?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Iniciar sesión con Firebase Auth (correo + contraseña)
 */
export async function firebaseLogin(
  email: string,
  password: string
): Promise<FirebaseLoginResult> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      message: "Firebase no está configurado. Revisa las variables VITE_FIREBASE_*.",
    };
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    return { success: false, message: "No se pudo inicializar Firebase Auth." };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return {
      success: true,
      message: `¡Bienvenido a Riqsi Rutas! (Firebase Auth)`,
      uid: cred.user.uid,
      email: cred.user.email ?? email,
    };
  } catch (err: any) {
    const msg = mapFirebaseError(err.code);
    return { success: false, message: msg };
  }
}

/**
 * Registrar nuevo usuario con Firebase Auth
 */
export async function firebaseRegister(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseLoginResult> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      message: "Firebase no está configurado. Revisa las variables VITE_FIREBASE_*.",
    };
  }

  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth) {
    return { success: false, message: "No se pudo inicializar Firebase Auth." };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const uid = cred.user.uid;

    // Guardar perfil básico en Firestore (colección "users")
    if (db) {
      await setDoc(doc(db, "users", uid), {
        uid,
        name: displayName.trim(),
        email: email.trim().toLowerCase(),
        role: "normal",
        status: "active",
        createdAt: serverTimestamp(),
      });
    }

    return {
      success: true,
      message: `¡Registro exitoso! Bienvenido ${displayName} (Firebase Auth).`,
      uid,
      email: cred.user.email ?? email,
    };
  } catch (err: any) {
    return { success: false, message: mapFirebaseError(err.code) };
  }
}

/**
 * Cerrar sesión en Firebase
 */
export async function firebaseLogout(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn("[Firebase] Error al cerrar sesión:", e);
  }
}

/**
 * Suscribirse a cambios de sesión (equivalente a onAuthStateChanged)
 * Devuelve la función de desuscripción.
 */
export function onFirebaseAuthChange(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ─── Firestore: colección "places" (compatible con Supabase services) ─────────

export async function firebaseGetPlaces() {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const snap = await getDocs(collection(db, "places"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("[Firebase] Error obteniendo places:", e);
    return null;
  }
}

export function firebaseSubscribeToPlaces(
  callback: (places: any[]) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};
  const q = collection(db, "places");
  const unsub = onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
  return unsub;
}

export async function firebaseSavePlace(place: any): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    await setDoc(doc(db, "places", place.id), place, { merge: true });
    return true;
  } catch (e) {
    console.warn("[Firebase] Error guardando place:", e);
    return false;
  }
}

export async function firebaseDeletePlace(id: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "places", id));
    return true;
  } catch (e) {
    console.warn("[Firebase] Error eliminando place:", e);
    return false;
  }
}

// ─── Firestore: colección "announcements" ─────────────────────────────────────

export async function firebaseGetAnnouncement() {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "announcements", "global-banner-1"));
    if (snap.exists()) return snap.data();
    return null;
  } catch (e) {
    console.warn("[Firebase] Error obteniendo announcement:", e);
    return null;
  }
}

export async function firebaseSaveAnnouncement(ann: any): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    await setDoc(doc(db, "announcements", "global-banner-1"), ann, {
      merge: true,
    });
    return true;
  } catch (e) {
    console.warn("[Firebase] Error guardando announcement:", e);
    return false;
  }
}

export function firebaseSubscribeToAnnouncement(
  callback: (ann: any) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};
  const unsub = onSnapshot(
    doc(db, "announcements", "global-banner-1"),
    (snap) => {
      if (snap.exists()) callback(snap.data());
    }
  );
  return unsub;
}

// ─── Firebase Storage: Subida de Imágenes ────────────────────────────────────

export async function firebaseUploadImage(file: File | Blob, path: string): Promise<string | null> {
  const storage = getFirebaseStorage();
  if (!storage) return null;
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    trackFirebaseEvent("image_uploaded", { path });
    return downloadUrl;
  } catch (e) {
    console.warn("[Firebase Storage] Error subiendo imagen:", e);
    return null;
  }
}

// ─── Firebase Firestore: Bookings / Reservas ──────────────────────────────────

export async function firebaseSaveBooking(booking: any): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    const bookingId = booking.id || `booking-${Date.now()}`;
    await setDoc(doc(db, "bookings", bookingId), {
      ...booking,
      id: bookingId,
      created_at: booking.createdAt || new Date().toISOString(),
    }, { merge: true });
    trackFirebaseEvent("booking_created", { bookingId, placeId: booking.placeId });
    return true;
  } catch (e) {
    console.warn("[Firebase] Error guardando reserva:", e);
    return false;
  }
}

export async function firebaseGetBookings(): Promise<any[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, "bookings"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("[Firebase] Error obteniendo reservas:", e);
    return [];
  }
}

// ─── Firebase Auth: Login Anónimo (Invitado Oficial) ──────────────────────────

export async function firebaseLoginAnonymous(): Promise<FirebaseLoginResult> {
  const auth = getFirebaseAuth();
  if (!auth) return { success: false, message: "Firebase Auth no inicializado" };
  try {
    const cred = await signInAnonymously(auth);
    trackFirebaseEvent("login_anonymous", { uid: cred.user.uid });
    return {
      success: true,
      message: "Sesión iniciada como Invitado Oficial en Firebase",
      uid: cred.user.uid,
      email: "invitado@riqsirutas.bo",
    };
  } catch (e: any) {
    return { success: false, message: e.message || "Error al iniciar como invitado" };
  }
}

// ─── Firebase Auth: Login con Google OAuth ───────────────────────────────────

export async function firebaseLoginWithGoogle(): Promise<FirebaseLoginResult & { user?: User }> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      message: "Firebase no está configurado. Revisa las variables VITE_FIREBASE_*.",
    };
  }

  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth) {
    return { success: false, message: "No se pudo inicializar Firebase Auth." };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    const fbUser = cred.user;

    const adaptedUser: User = {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split("@")[0] || "Turista Google",
      username: (fbUser.email?.split("@")[0] || fbUser.uid).toLowerCase(),
      email: fbUser.email || "",
      passwordHash: "",
      role: "normal",
      status: "active",
      avatar: fbUser.photoURL || "🎒",
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString(),
    };

    if (db) {
      await setDoc(
        doc(db, "users", fbUser.uid),
        {
          uid: fbUser.uid,
          name: adaptedUser.name,
          email: adaptedUser.email,
          role: "normal",
          status: "active",
          avatar: adaptedUser.avatar,
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    }

    trackFirebaseEvent("login_google", { uid: fbUser.uid });

    return {
      success: true,
      message: `¡Bienvenido ${adaptedUser.name}! Has ingresado con tu cuenta Google.`,
      uid: fbUser.uid,
      email: fbUser.email || "",
      user: adaptedUser,
    };
  } catch (err: any) {
    const msg = mapFirebaseError(err.code);
    return { success: false, message: msg };
  }
}

// ─── Firebase Realtime Database: Alertas en Vivo de la Llajta ─────────────────

export interface LiveLlajtaAlert {
  id?: string;
  badge: string;
  message: string;
  level: "info" | "warning" | "success";
  timestamp: string;
}

export function subscribeToRealtimeAlerts(callback: (alert: LiveLlajtaAlert | null) => void): () => void {
  const rtdb = getFirebaseRtdb();
  if (!rtdb) {
    callback(null);
    return () => {};
  }

  try {
    const alertRef = rtdbRef(rtdb, "alerts/live");
    const unsubscribe = rtdbOnValue(alertRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data as LiveLlajtaAlert);
      } else {
        callback(null);
      }
    });
    return () => unsubscribe();
  } catch (e) {
    console.warn("[Firebase RTDB] Error suscribiendo a alertas en vivo:", e);
    return () => {};
  }
}

export async function publishRealtimeAlert(alert: LiveLlajtaAlert): Promise<boolean> {
  const rtdb = getFirebaseRtdb();
  if (!rtdb) return false;
  try {
    const alertRef = rtdbRef(rtdb, "alerts/live");
    await rtdbSet(alertRef, {
      ...alert,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    console.warn("[Firebase RTDB] Error publicando alerta:", e);
    return false;
  }
}

// ─── Firebase Storage: Subida de imágenes con validación ──────────────────────

export async function firebaseUploadPlaceImageValidated(file: File, folder: string = "places"): Promise<{ success: boolean; url?: string; message: string }> {
  // Validar tamaño máximo (5 MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, message: "El archivo supera el límite de 5 MB." };
  }

  // Validar tipo MIME permitido
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, message: "Formato no permitido. Solo se aceptan imágenes JPEG, PNG o WebP." };
  }

  const storage = getFirebaseStorage();
  if (!storage) {
    return { success: false, message: "Firebase Storage no está configurado." };
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const storageRef = ref(storage, filename);
    const snap = await uploadBytes(storageRef, file, { contentType: file.type });
    const downloadUrl = await getDownloadURL(snap.ref);
    return { success: true, url: downloadUrl, message: "Imagen subida exitosamente a Firebase Storage" };
  } catch (e: any) {
    return { success: false, message: e.message || "Error al subir la imagen" };
  }
}

// ─── Helper: mapear errores de Firebase Auth ──────────────────────────────────
function mapFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/user-not-found": "No existe un usuario con ese correo electrónico.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Credenciales inválidas.",
    "auth/email-already-in-use": "Ese correo electrónico ya está registrado.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-email": "El formato del correo electrónico no es válido.",
    "auth/too-many-requests":
      "Demasiados intentos. Cuenta temporalmente bloqueada.",
    "auth/network-request-failed":
      "Error de red. Verifica tu conexión a internet.",
    "auth/configuration-not-found":
      "El acceso con Google debe habilitarse en Firebase Console (Authentication → Sign-in method → Habilitar Google). Puedes ingresar con correo/contraseña o con las cuentas demo.",
    "auth/popup-closed-by-user":
      "Ventana de Google cerrada antes de completar el inicio de sesión.",
    "auth/cancelled-popup-request":
      "Operación cancelada por otra ventana emergente en curso.",
    "auth/popup-blocked":
      "Tu navegador bloqueó la ventana emergente de Google. Por favor permite ventanas emergentes.",
  };
  return map[code] ?? `Error de autenticación: ${code}`;
}

