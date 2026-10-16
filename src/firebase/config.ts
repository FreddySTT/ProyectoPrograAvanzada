import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const FIREBASE_LOCAL_STORAGE_KEY = "riqsi_firebase_custom_config_v1";

// 1. Check Vite env variables
const envConfig: Partial<FirebaseConfig> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// 2. Check localStorage for in-app configuration
export function getSavedCustomConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(FIREBASE_LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) return parsed;
    }
  } catch (e) {
    console.error("Error reading custom Firebase config", e);
  }
  return null;
}

export function saveCustomConfig(config: FirebaseConfig) {
  try {
    localStorage.setItem(FIREBASE_LOCAL_STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error("Error saving custom Firebase config", e);
  }
}

export function clearCustomConfig() {
  localStorage.removeItem(FIREBASE_LOCAL_STORAGE_KEY);
  window.location.reload();
}

// Determine active config: env takes precedence if present, then custom localStorage, then fallback
export function getActiveFirebaseConfig(): FirebaseConfig {
  const custom = getSavedCustomConfig();
  if (custom && custom.apiKey && custom.projectId) {
    return custom;
  }

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig as FirebaseConfig;
  }

  // Fallback demo config placeholder (ensures SDK initializes gracefully without unhandled crashes)
  return {
    apiKey: envConfig.apiKey || "demo-api-key-riqsi-rutas",
    authDomain: envConfig.authDomain || "riqsi-rutas-cbba.firebaseapp.com",
    projectId: envConfig.projectId || "riqsi-rutas-cbba",
    storageBucket: envConfig.storageBucket || "riqsi-rutas-cbba.appspot.com",
    messagingSenderId: envConfig.messagingSenderId || "1234567890",
    appId: envConfig.appId || "1:1234567890:web:abcdef123456",
  };
}

export function isFirebaseLiveConfigured(): boolean {
  const custom = getSavedCustomConfig();
  if (custom && custom.apiKey && custom.apiKey.length > 20 && !custom.apiKey.startsWith("demo-")) {
    return true;
  }
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envKey && envKey.length > 20 && !envKey.startsWith("demo-")) {
    return true;
  }
  return false;
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  const activeConfig = getActiveFirebaseConfig();
  if (!getApps().length) {
    app = initializeApp(activeConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization warning (using local fallback mode):", error);
}

export { app, auth, db };
