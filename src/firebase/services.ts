import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, isFirebaseLiveConfigured } from "./config";
import type { PlaceItem, Announcement, User, SecurityLog, Role } from "../types/auth";
import { INITIAL_PLACES, INITIAL_ANNOUNCEMENT } from "../data/initialData";

const PLACES_COLLECTION = "places";
const ANNOUNCEMENTS_COLLECTION = "announcements";
const USERS_COLLECTION = "users";
const LOGS_COLLECTION = "security_logs";

const PLACES_LOCAL_KEY = "riqsi_places_v1";
const ANNOUNCEMENT_LOCAL_KEY = "riqsi_announcement_v1";
const USERS_LOCAL_KEY = "riqsi_users_v1";
const LOGS_LOCAL_KEY = "riqsi_security_logs_v1";

// ========================
// SECURITY AUDIT LOGGING
// ========================
export function getLocalSecurityLogs(): SecurityLog[] {
  try {
    const raw = localStorage.getItem(LOGS_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function recordSecurityLog(
  log: Omit<SecurityLog, "id" | "timestamp">
): Promise<void> {
  const newLog: SecurityLog = {
    id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };

  // Local sync
  try {
    const existing = getLocalSecurityLogs();
    const updated = [newLog, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(LOGS_LOCAL_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Local security log error", e);
  }

  // Cloud sync if configured
  if (isFirebaseLiveConfigured() && db) {
    try {
      await setDoc(doc(db, LOGS_COLLECTION, newLog.id), newLog);
    } catch (e) {
      console.warn("Could not push security log to Firestore", e);
    }
  }
}

export function subscribeToSecurityLogs(
  onUpdate: (logs: SecurityLog[]) => void
): () => void {
  if (isFirebaseLiveConfigured() && db) {
    try {
      const q = query(collection(db, LOGS_COLLECTION), orderBy("timestamp", "desc"), limit(40));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => d.data() as SecurityLog);
            onUpdate(list);
          } else {
            onUpdate(getLocalSecurityLogs());
          }
        },
        () => {
          onUpdate(getLocalSecurityLogs());
        }
      );
    } catch (e) {
      onUpdate(getLocalSecurityLogs());
    }
  }
  onUpdate(getLocalSecurityLogs());
  return () => {};
}

// ========================
// PLACES / DESTINATIONS
// ========================
export function getLocalPlaces(): PlaceItem[] {
  try {
    const raw = localStorage.getItem(PLACES_LOCAL_KEY);
    if (!raw) return INITIAL_PLACES;
    const stored: PlaceItem[] = JSON.parse(raw);
    const storedMap = new Map(stored.map((p) => [p.id, p]));
    let modified = false;
    for (const initP of INITIAL_PLACES) {
      if (!storedMap.has(initP.id)) {
        stored.push(initP);
        modified = true;
      } else {
        const cur = storedMap.get(initP.id)!;
        if (initP.coordinates && (!cur.coordinates || cur.coordinates[0] !== initP.coordinates[0])) {
          cur.coordinates = initP.coordinates;
          modified = true;
        }
      }
    }
    if (modified) {
      try {
        localStorage.setItem(PLACES_LOCAL_KEY, JSON.stringify(stored));
      } catch (e) {
        console.warn("Could not persist merged places to localStorage", e);
      }
    }
    return stored;
  } catch {
    return INITIAL_PLACES;
  }
}

export async function seedInitialPlacesIfNeeded(): Promise<void> {
  if (!isFirebaseLiveConfigured() || !db) return;
  try {
    const snapshot = await getDocs(collection(db, PLACES_COLLECTION));
    if (snapshot.empty) {
      for (const place of INITIAL_PLACES) {
        await setDoc(doc(db, PLACES_COLLECTION, place.id), place);
      }
    }
  } catch (e) {
    console.warn("Could not seed places to Firestore", e);
  }
}

export function subscribeToPlaces(
  onUpdate: (places: PlaceItem[]) => void
): () => void {
  // First load from local storage cache
  onUpdate(getLocalPlaces());

  if (isFirebaseLiveConfigured() && db) {
    try {
      const unsubscribe = onSnapshot(
        collection(db, PLACES_COLLECTION),
        (snapshot) => {
          if (!snapshot.empty) {
            const places = snapshot.docs.map((d) => d.data() as PlaceItem);
            localStorage.setItem(PLACES_LOCAL_KEY, JSON.stringify(places));
            onUpdate(places);
          } else {
            // Seed if completely empty
            seedInitialPlacesIfNeeded();
          }
        },
        (err) => {
          console.warn("Firestore places subscription fallback to local cache:", err.message);
          onUpdate(getLocalPlaces());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Firestore error subscribing to places", e);
    }
  }
  return () => {};
}

export async function savePlace(place: PlaceItem): Promise<void> {
  // Update local cache
  const places = getLocalPlaces();
  const exists = places.some((p) => p.id === place.id);
  const updated = exists ? places.map((p) => (p.id === place.id ? place : p)) : [place, ...places];
  localStorage.setItem(PLACES_LOCAL_KEY, JSON.stringify(updated));

  // Sync to Firestore
  if (isFirebaseLiveConfigured() && db) {
    await setDoc(doc(db, PLACES_COLLECTION, place.id), {
      ...place,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function deletePlace(placeId: string): Promise<void> {
  // Update local cache
  const places = getLocalPlaces();
  const updated = places.filter((p) => p.id !== placeId);
  localStorage.setItem(PLACES_LOCAL_KEY, JSON.stringify(updated));

  // Sync to Firestore
  if (isFirebaseLiveConfigured() && db) {
    await deleteDoc(doc(db, PLACES_COLLECTION, placeId));
  }
}

// ========================
// ANNOUNCEMENTS
// ========================
export function getLocalAnnouncement(): Announcement {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENT_LOCAL_KEY);
    return raw ? JSON.parse(raw) : INITIAL_ANNOUNCEMENT;
  } catch {
    return INITIAL_ANNOUNCEMENT;
  }
}

export function subscribeToAnnouncement(
  onUpdate: (announcement: Announcement) => void
): () => void {
  onUpdate(getLocalAnnouncement());

  if (isFirebaseLiveConfigured() && db) {
    try {
      const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, "current");
      return onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Announcement;
            localStorage.setItem(ANNOUNCEMENT_LOCAL_KEY, JSON.stringify(data));
            onUpdate(data);
          }
        },
        (err) => {
          console.warn("Firestore announcement listener error:", err.message);
          onUpdate(getLocalAnnouncement());
        }
      );
    } catch (e) {
      console.warn("Firestore error subscribing to announcement", e);
    }
  }
  return () => {};
}

export async function saveAnnouncement(announcement: Announcement): Promise<void> {
  localStorage.setItem(ANNOUNCEMENT_LOCAL_KEY, JSON.stringify(announcement));

  if (isFirebaseLiveConfigured() && db) {
    await setDoc(doc(db, ANNOUNCEMENTS_COLLECTION, "current"), {
      ...announcement,
      updatedAt: new Date().toISOString(),
    });
  }
}

// ========================
// USERS MANAGEMENT
// ========================
export function getLocalUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading local users", e);
  }
  return [];
}

export function subscribeToUsers(
  onUpdate: (users: User[]) => void
): () => void {
  onUpdate(getLocalUsers());

  if (isFirebaseLiveConfigured() && db) {
    try {
      return onSnapshot(
        collection(db, USERS_COLLECTION),
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map((d) => d.data() as User);
            localStorage.setItem(USERS_LOCAL_KEY, JSON.stringify(list));
            onUpdate(list);
          }
        },
        (err) => {
          console.warn("Users subscription fallback to local cache:", err.message);
          onUpdate(getLocalUsers());
        }
      );
    } catch (e) {
      console.warn("Error subscribing to users", e);
    }
  }
  return () => {};
}

export async function saveUserDoc(user: User): Promise<void> {
  const users = getLocalUsers();
  const exists = users.some((u) => u.id === user.id || (user.uid && u.uid === user.uid));
  const updated = exists
    ? users.map((u) => (u.id === user.id || (user.uid && u.uid === user.uid) ? user : u))
    : [user, ...users];
  localStorage.setItem(USERS_LOCAL_KEY, JSON.stringify(updated));

  if (isFirebaseLiveConfigured() && db) {
    const docId = user.uid || user.id;
    await setDoc(doc(db, USERS_COLLECTION, docId), {
      ...user,
      lastLogin: new Date().toISOString(),
    });
  }
}

export async function updateUserRoleInFirestore(userId: string, role: Role): Promise<void> {
  const users = getLocalUsers();
  const updated = users.map((u) => (u.id === userId || u.uid === userId ? { ...u, role } : u));
  localStorage.setItem(USERS_LOCAL_KEY, JSON.stringify(updated));

  if (isFirebaseLiveConfigured() && db) {
    await setDoc(doc(db, USERS_COLLECTION, userId), { role }, { merge: true });
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const users = getLocalUsers();
  const updated = users.filter((u) => u.id !== userId && u.uid !== userId);
  localStorage.setItem(USERS_LOCAL_KEY, JSON.stringify(updated));

  if (isFirebaseLiveConfigured() && db) {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  }
}
