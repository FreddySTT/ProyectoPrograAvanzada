// ==============================================================================
// Firebase Configuration — Riqsi Rutas
// Se activa cuando VITE_BACKEND=firebase (el default es "supabase")
// ==============================================================================
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics, logEvent } from "firebase/analytics";
import { getDatabase, type Database } from "firebase/database";
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WDHDETLEDV",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID || "riqsi-rutas"}-default-rtdb.firebaseio.com`,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId
  );
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let firebaseAnalytics: Analytics | null = null;
let firebaseRtdb: Database | null = null;
let firebaseAppCheck: AppCheck | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (firebaseApp) return firebaseApp;
  try {
    // Evitar múltiples inicializaciones en HMR (dev)
    firebaseApp =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);
    return firebaseApp;
  } catch (e) {
    console.warn("[Firebase] No se pudo inicializar la app:", e);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (firebaseAuth) return firebaseAuth;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    firebaseAuth = getAuth(app);
    return firebaseAuth;
  } catch (e) {
    console.warn("[Firebase] No se pudo obtener Auth:", e);
    return null;
  }
}

export function getFirebaseDb(): Firestore | null {
  if (firebaseDb) return firebaseDb;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    firebaseDb = getFirestore(app);
    return firebaseDb;
  } catch (e) {
    console.warn("[Firebase] No se pudo obtener Firestore:", e);
    return null;
  }
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (firebaseStorage) return firebaseStorage;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    firebaseStorage = getStorage(app);
    return firebaseStorage;
  } catch (e) {
    console.warn("[Firebase] No se pudo inicializar Storage:", e);
    return null;
  }
}

export async function getFirebaseAnalyticsInstance(): Promise<Analytics | null> {
  if (firebaseAnalytics) return firebaseAnalytics;
  const app = getFirebaseApp();
  if (!app || typeof window === "undefined") return null;
  try {
    const supported = await isAnalyticsSupported();
    if (supported) {
      firebaseAnalytics = getAnalytics(app);
      return firebaseAnalytics;
    }
    return null;
  } catch (e) {
    console.warn("[Firebase] Analytics no soportado en este entorno:", e);
    return null;
  }
}

export async function trackFirebaseEvent(eventName: string, params?: Record<string, any>) {
  try {
    const analytics = await getFirebaseAnalyticsInstance();
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch {}
}

/**
 * Obtiene la instancia de Firebase Realtime Database para sincronización ultrarrápida
 */
export function getFirebaseRtdb(): Database | null {
  if (firebaseRtdb) return firebaseRtdb;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    firebaseRtdb = getDatabase(app);
    return firebaseRtdb;
  } catch (e) {
    console.warn("[Firebase] No se pudo inicializar Realtime Database:", e);
    return null;
  }
}

/**
 * Inicializa Firebase App Check para proteger la aplicación web contra bots y abuso
 */
export function initFirebaseAppCheck(): AppCheck | null {
  if (firebaseAppCheck) return firebaseAppCheck;
  const app = getFirebaseApp();
  if (!app || typeof window === "undefined") return null;

  try {
    const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
    // Si estamos en localhost, habilitar debug token para no bloquear desarrollo
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    if (recaptchaKey) {
      firebaseAppCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
      return firebaseAppCheck;
    }
  } catch (e) {
    console.warn("[Firebase] App Check no pudo inicializarse:", e);
  }
  return null;
}


