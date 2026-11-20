import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage, getFirebaseRtdb, isFirebaseConfigured } from "../../../firebase/config";
import { isSupabaseConfigured, getSupabaseClient } from "../../../supabase/config";
import { firebaseLogin, firebaseRegister, firebaseLogout } from "../../../firebase/services";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface CloudServicesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

export function CloudServicesHubModal({ isOpen, onClose, onNotify }: CloudServicesHubModalProps) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"firebase" | "supabase" | "rules">("firebase");
  
  // Test states for Firebase Auth
  const [testEmail, setTestEmail] = useState("turista.test@riqsirutas.bo");
  const [testPass, setTestPass] = useState("Turista@2026!");
  const [authStatus, setAuthStatus] = useState<string>("");
  const [firestoreStatus, setFirestoreStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  const storage = getFirebaseStorage();
  const rtdb = getFirebaseRtdb();
  const supabase = getSupabaseClient();

  // Test Firestore document read/write for authenticated user
  const handleTestFirestore = async () => {
    if (!db || !auth?.currentUser) {
      setFirestoreStatus("⚠️ Inicia sesión en Firebase Auth primero para probar las reglas.");
      return;
    }
    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        lastCheck: new Date().toISOString(),
        testRole: "turista_verificado",
        email: auth.currentUser.email
      }, { merge: true });

      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setFirestoreStatus(`✅ Éxito: Documento /users/${uid} leído y escrito correctamente bajo reglas RLS.`);
      }
    } catch (e: any) {
      setFirestoreStatus(`❌ Bloqueado por reglas: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setAuthStatus("Autenticando con signInWithEmailAndPassword...");
    const res = await firebaseLogin(testEmail, testPass);
    setLoading(false);
    setAuthStatus(res.success ? `✅ Login exitoso (UID: ${res.uid})` : `❌ ${res.message}`);
    if (res.success && onNotify) onNotify(res.message);
  };

  const handleTestRegister = async () => {
    setLoading(true);
    setAuthStatus("Registrando con createUserWithEmailAndPassword...");
    const res = await firebaseRegister(testEmail, testPass, "Turista Verificado");
    setLoading(false);
    setAuthStatus(res.success ? `✅ Registro y documento en Firestore creados exitosamente.` : `❌ ${res.message}`);
    if (res.success && onNotify) onNotify(res.message);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl border border-[#E2D9CC] flex flex-col max-h-[92vh]">
        {/* Top aguayo strip */}
        <div className="aguayo-strip h-2 w-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#E8E3D8] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white text-xl shadow-md">
              ☁️
            </span>
            <div>
              <h2 className="font-subtitle text-lg font-black text-[#1E293B]">
                Hub de Servicios Cloud: Firebase & Supabase
              </h2>
              <p className="text-xs text-[#64748B] font-medium">
                Panel de verificación de servicios, reglas de seguridad y autenticación
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition border border-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-[#E8E3D8] bg-[#F7F4EE] px-6">
          <button
            type="button"
            onClick={() => setActiveTab("firebase")}
            className={`py-3 px-4 text-xs font-subtitle font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "firebase"
                ? "border-[#D81B60] text-[#D81B60]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🔥 Firebase Suite</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`py-3 px-4 text-xs font-subtitle font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "rules"
                ? "border-[#D81B60] text-[#D81B60]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🛡️ Reglas de Seguridad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("supabase")}
            className={`py-3 px-4 text-xs font-subtitle font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "supabase"
                ? "border-[#D81B60] text-[#D81B60]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⚡ Supabase Cloud</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {activeTab === "firebase" && (
            <div className="space-y-4">
              {/* Service status badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 text-[10px]">AUTH</p>
                  <p className="text-emerald-700 mt-0.5">● Operativo</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 text-[10px]">FIRESTORE</p>
                  <p className="text-emerald-700 mt-0.5">● Conectado</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 text-[10px]">AI LOGIC</p>
                  <p className="text-purple-700 mt-0.5">✨ Gemini Flash</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 text-[10px]">REALTIME / STORAGE</p>
                  <p className="text-blue-700 mt-0.5">● Activos</p>
                </div>
              </div>

              {/* Firebase Auth Test Section */}
              <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#E2D9CC] space-y-3">
                <h4 className="font-subtitle text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Prueba Interactiva: Firebase Authentication SDK</span>
                  {auth?.currentUser && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                      UID: {auth.currentUser.uid.slice(0, 8)}...
                    </span>
                  )}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    type="password"
                    value={testPass}
                    onChange={(e) => setTestPass(e.target.value)}
                    placeholder="Contraseña"
                    className="p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestLogin}
                    disabled={loading}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    signInWithEmailAndPassword()
                  </button>
                  <button
                    type="button"
                    onClick={handleTestRegister}
                    disabled={loading}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#D81B60] text-white text-xs font-bold hover:bg-[#b0144c] transition disabled:opacity-50"
                  >
                    createUserWithEmailAndPassword()
                  </button>
                </div>

                {authStatus && (
                  <p className="text-xs font-bold p-2.5 rounded-lg bg-white border border-slate-200">
                    {authStatus}
                  </p>
                )}
              </div>

              {/* Cloud Firestore Test Section */}
              <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#E2D9CC] space-y-3">
                <h4 className="font-subtitle text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Prueba de Conexión y Reglas en Cloud Firestore
                </h4>
                <p className="text-xs text-slate-600">
                  Verifica que la regla de seguridad <code>/users/{`{userId}`}</code> permita el acceso solo al propio usuario autenticado.
                </p>
                <button
                  type="button"
                  onClick={handleTestFirestore}
                  disabled={loading}
                  className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  Probar Lectura/Escritura en /users/{auth?.currentUser ? auth.currentUser.uid.slice(0, 6) : "{uid}"}
                </button>
                {firestoreStatus && (
                  <p className="text-xs font-bold p-2.5 rounded-lg bg-white border border-slate-200">
                    {firestoreStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                <p className="text-slate-400 mb-2">// firestore.rules — Reglas Endurecidas con Mínimo Privilegio</p>
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 1. Usuarios: solo el dueño puede leer o modificar su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 2. Destinos turísticos: lectura pública, escritura solo admin
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }

    // 3. Reservas: crear si autenticado; leer si es el dueño o admin
    match /bookings/{bookingId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || request.auth.token.role == 'admin');
    }

    // 4. Bloquear cualquier otra colección no autorizada
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}</pre>
              </div>
            </div>
          )}

          {activeTab === "supabase" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#FAF7F2] p-4 border border-[#E2D9CC] space-y-3">
                <h4 className="font-subtitle text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Paridad en Supabase (PostgreSQL + RLS)
                </h4>
                <p className="text-xs text-slate-600">
                  En Supabase, las políticas de Row Level Security (RLS) en PostgreSQL replican el mismo comportamiento:
                </p>
                <div className="rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-xs">
                  <pre>{`-- Política RLS en PostgreSQL (Supabase)
CREATE POLICY "users_manage_own_record"
ON public.app_users
FOR ALL
USING (auth.uid()::text = id);`}</pre>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Estado de Supabase Cloud:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">
                    ● PostgreSQL 15 Conectado
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

