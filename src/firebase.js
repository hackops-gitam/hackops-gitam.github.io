import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  // Replace with your config from Firebase Console > Project Settings > General > Your apps
  apiKey: "AIzaSyDac5PmzSszcIRCFcoeSpbyLwejWmWo-4I",
  authDomain: "hackops-gitam.firebaseapp.com",
  projectId: "hackops-gitam",
  storageBucket: "hackops-gitam.firebasestorage.app",
  messagingSenderId: "339122760814",
  appId: "1:339122760814:web:7efe1327e032b177874a7f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);