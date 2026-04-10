import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getStoredJson, setStoredJson, removeStoredValue } from '../storage/keyValueStore';

const ADMIN_SESSION_KEY = 'medical-app/admin-session';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const adminDemoPassword = process.env.EXPO_PUBLIC_ADMIN_DEMO_PASSWORD?.trim();

function isLocalPreviewHost() {
  const hostname = globalThis.location?.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export interface AdminSession {
  mode: 'firebase' | 'local';
  email: string;
  signedInAt: string;
}

export function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId,
  );
}

export function isAdminDemoEnabled() {
  return process.env.EXPO_PUBLIC_ENABLE_ADMIN_DEMO === 'true' || isLocalPreviewHost();
}

export function getFirebaseApp() {
  if (!hasFirebaseConfig()) return undefined;
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : undefined;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  return getStoredJson<AdminSession | null>(ADMIN_SESSION_KEY, null);
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const auth = getFirebaseAuth();

  if (auth) {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const session: AdminSession = {
      mode: 'firebase',
      email: result.user.email ?? email.trim(),
      signedInAt: new Date().toISOString(),
    };
    await setStoredJson(ADMIN_SESSION_KEY, session);
    return session;
  }

  if (!isAdminDemoEnabled()) {
    throw new Error(
      'Admin sign-in requires Firebase credentials or explicit demo mode env vars.',
    );
  }

  const localPassword = adminDemoPassword ?? 'medstudy-admin';
  if (password !== localPassword) {
    throw new Error('Admin credentials were rejected.');
  }

  const session: AdminSession = {
    mode: 'local',
    email: email.trim() || 'local-admin@medical.app',
    signedInAt: new Date().toISOString(),
  };
  await setStoredJson(ADMIN_SESSION_KEY, session);
  return session;
}

export async function signOutAdmin(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth?.currentUser) {
    await signOut(auth);
  }
  await removeStoredValue(ADMIN_SESSION_KEY);
}

export function getCurrentFirebaseUser(): User | null | undefined {
  return getFirebaseAuth()?.currentUser;
}

// ── Regular user auth (separate from admin) ────────────────────────────────

export async function signInUser(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase is not configured.');
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function signUpUser(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase is not configured.');
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth?.currentUser) {
    await signOut(auth);
  }
}

export function subscribeToUserAuth(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
