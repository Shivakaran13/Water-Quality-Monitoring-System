import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Resident } from "./brevoApi";

// --- Users (Profiles & Settings) ---

export interface UserProfile {
  displayName: string;
  email: string;
  role: string;
  stationName: string;
  preferences: {
    notifications: boolean;
    criticalAlerts: boolean;
    emailReports: boolean;
    autoSync: boolean;
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, profile: Partial<UserProfile>) {
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, profile, { merge: true });
}

// --- Residents (Email Alert Recipients) ---

export async function getResidentsFromFirestore(): Promise<Resident[]> {
  const resCol = collection(db, "residents");
  const q = query(resCol);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Resident, "id">),
  }));
}

export async function addResidentToFirestore(name: string, email: string): Promise<Resident> {
  const resCol = collection(db, "residents");
  const docRef = await addDoc(resCol, {
    name,
    email,
    addedAt: serverTimestamp(),
  });
  return { id: docRef.id, name, email };
}

export async function removeResidentFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, "residents", id);
  await deleteDoc(docRef);
}

// --- Alert History ---

export interface AlertLog {
  parameter: string;
  value: number;
  unit: string;
  severity: string;
  message: string;
  timestamp: any; // Firestore Timestamp
}

export async function logAlertToFirestore(alert: Omit<AlertLog, "timestamp">) {
  const logsCol = collection(db, "alert_history");
  await addDoc(logsCol, {
    ...alert,
    timestamp: serverTimestamp(),
  });
}

export async function getRecentAlertHistory(maxCount = 50): Promise<AlertLog[]> {
  const logsCol = collection(db, "alert_history");
  const q = query(logsCol, orderBy("timestamp", "desc"), limit(maxCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as AlertLog);
}
