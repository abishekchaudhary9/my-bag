import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

if (firebaseAuth) {
  firebaseAuth.useDeviceLanguage();
}

export function getConfiguredFirebaseAuth() {
  if (!firebaseAuth) {
    throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* variables to the client environment.");
  }

  return firebaseAuth;
}

export function createRecaptchaVerifier(containerId: string) {
  return new RecaptchaVerifier(getConfiguredFirebaseAuth(), containerId, {
    size: "invisible",
  });
}

