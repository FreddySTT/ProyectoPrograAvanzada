// ==============================================================================
// Firebase Configuration — Riqsi Rutas
// Se activa cuando VITE_BACKEND=firebase (el default es "supabase")
// ==============================================================================
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
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

