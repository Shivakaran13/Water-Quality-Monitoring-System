// Firebase initialization for AquaMonitor
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvHLnvjZG__Py8nleGWSdEKtXwMoKKDfU",
  authDomain: "water-quality-monitoring-c3b40.firebaseapp.com",
  projectId: "water-quality-monitoring-c3b40",
  storageBucket: "water-quality-monitoring-c3b40.firebasestorage.app",
  messagingSenderId: "841122629953",
  appId: "1:841122629953:web:22d6948e499df97ccdf9c0",
  measurementId: "G-G7TRSLSX4Q",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth helpers
export const loginWithEmail    = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithGoogle   = () => signInWithPopup(auth, googleProvider);

export const logout            = () => signOut(auth);

export const resetPassword     = (email: string) =>
  sendPasswordResetEmail(auth, email);

export { onAuthStateChanged, type User };
export default app;
