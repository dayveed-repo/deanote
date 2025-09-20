import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const projectId = process.env.FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: projectId + ".firebaseapp.com",
  databaseURL: `https://${projectId}.firebaseio.com`,
  projectId: projectId,
  storageBucket: projectId + ".appspot.com",
  messagingSenderId: "360731163578",
  appId: "1:360731163578:web:31f2b56c810d074cc57b83",
  measurementId: "G-E4DZY81FZS",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: projectId + ".appspot.com",
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // db
export const adminBucket = admin.storage().bucket();

// firebase storage
export const storageBucket = getStorage(app);
