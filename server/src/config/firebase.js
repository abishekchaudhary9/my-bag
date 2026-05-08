const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const env = require("./env");

function normalizePrivateKey(value) {
  return value ? value.replace(/\\n/g, "\n") : "";
}

function getCredentialConfig() {
  if (env.firebase.serviceAccount) {
    return {
      credential: cert({
        ...env.firebase.serviceAccount,
        private_key: normalizePrivateKey(env.firebase.serviceAccount.private_key),
      }),
    };
  }

  if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
    return {
      credential: cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: normalizePrivateKey(env.firebase.privateKey),
      }),
    };
  }

  return null;
}

function isFirebaseAdminConfigured() {
  return Boolean(getCredentialConfig());
}

function getFirebaseAuth() {
  const config = getCredentialConfig();

  if (!config) {
    throw new Error("Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.");
  }

  const app = getApps()[0] || initializeApp(config);
  return getAuth(app);
}

module.exports = {
  getFirebaseAuth,
  isFirebaseAdminConfigured,
};
