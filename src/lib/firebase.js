import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const demo_mode = String(import.meta.env.VITE_DEMO_MODE || "").toLowerCase() === "true";

const firebase_config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const mentor_emails = String(import.meta.env.VITE_MENTOR_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function is_configured() {
  return Boolean(firebase_config.apiKey && firebase_config.projectId) || demo_mode;
}

export function is_demo_mode() {
  return demo_mode || !firebase_config.apiKey;
}

let app = null;
let auth = null;
let db = null;

function ensure_firebase() {
  if (is_demo_mode()) return null;
  if (!app) {
    app = initializeApp(firebase_config);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { auth, db };
}

export function is_mentor(email) {
  if (!email) return false;
  const e = email.toLowerCase();
  if (mentor_emails.includes(e)) return true;
  if (is_demo_mode() && e === "mentor@demo.local") return true;
  return false;
}

export function watch_auth(on_user) {
  if (is_demo_mode()) {
    const raw = localStorage.getItem("progress_demo_user");
    on_user(raw ? JSON.parse(raw) : null);
    return () => {};
  }
  ensure_firebase();
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      on_user(null);
      return;
    }
    on_user({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  });
}

export async function login_google() {
  if (is_demo_mode()) {
    throw new Error("Use demo login buttons in demo mode.");
  }
  ensure_firebase();
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function login_demo(role) {
  const user =
    role === "mentor"
      ? { uid: "demo-mentor", email: "mentor@demo.local", displayName: "Mentor (demo)" }
      : { uid: "demo-mentee", email: "mentee@demo.local", displayName: "Mentee (demo)" };
  localStorage.setItem("progress_demo_user", JSON.stringify(user));
  return user;
}

export async function logout() {
  if (is_demo_mode()) {
    localStorage.removeItem("progress_demo_user");
    return;
  }
  ensure_firebase();
  await signOut(auth);
}

export async function load_progress(uid) {
  if (is_demo_mode()) {
    const raw = localStorage.getItem(`progress_demo_${uid}`);
    return raw ? JSON.parse(raw) : null;
  }
  ensure_firebase();
  const snap = await getDoc(doc(db, "progress", uid));
  return snap.exists() ? snap.data() : null;
}

export async function save_progress(uid, progress, profile) {
  const payload = {
    ...progress,
    email: profile.email || "",
    displayName: profile.displayName || "",
    updated_at: new Date().toISOString(),
  };
  if (is_demo_mode()) {
    localStorage.setItem(`progress_demo_${uid}`, JSON.stringify(payload));
    return payload;
  }
  ensure_firebase();
  await setDoc(
    doc(db, "progress", uid),
    { ...payload, updated_at: serverTimestamp() },
    { merge: true }
  );
  return payload;
}

export async function list_all_progress() {
  if (is_demo_mode()) {
    const mentee = localStorage.getItem("progress_demo_demo-mentee");
    const rows = [];
    if (mentee) {
      const data = JSON.parse(mentee);
      rows.push({ uid: "demo-mentee", ...data });
    }
    return rows;
  }
  ensure_firebase();
  const snap = await getDocs(collection(db, "progress"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}
