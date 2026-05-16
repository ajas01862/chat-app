// src/firebase/config.js
import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  getFirestore, doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
// import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "website-3bb62.firebaseapp.com",
  projectId: "website-3bb62",
  storageBucket: "website-3bb62.appspot.com",
  messagingSenderId: "246954303191",
  appId: "1:246954303191:web:28e88050bdb40ed2db5a92",
  measurementId: "G-QQJXZR3W5X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// export const auth = getAuth(app);
// export const db = getFirestore(app);

export {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
};