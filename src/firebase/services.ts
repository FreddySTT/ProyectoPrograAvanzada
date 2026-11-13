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
import {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseStorage,
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
  };
  return map[code] ?? `Error de autenticación: ${code}`;
}

