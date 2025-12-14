import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

// Variables para lazy initialization
let _app: App | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;

function getAdminApp(): App {
  if (!_app) {
    _app = getApps().length > 0 ? getApps()[0] : initializeApp();
  }
  return _app;
}

// Funciones getter para inicialización lazy
export function getDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getAdminApp());
  }
  return _db;
}

export function getAdminAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getAdminApp());
  }
  return _auth;
}

// Wrappers para compatibilidad con código existente
export const db = {
  collection: (path: string) => getDb().collection(path),
  doc: (path: string) => getDb().doc(path),
};

export const auth = {
  setCustomUserClaims: (uid: string, claims: object) => getAdminAuth().setCustomUserClaims(uid, claims),
  getUser: (uid: string) => getAdminAuth().getUser(uid),
};
