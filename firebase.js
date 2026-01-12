import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAEmKulLR-sE0bogP3gvLxhAtxtBjImwxM",
  authDomain: "hrmsmd.firebaseapp.com",
  projectId: "hrmsmd",
  storageBucket: "hrmsmd.firebasestorage.app",
  messagingSenderId: "631338594096",
  appId: "1:631338594096:web:bcc13b617ed6b5652962f5",
  measurementId: "G-XB3YWC9M8E",
};

// ✅ Prevent multiple initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Messaging only on supported browsers
let messaging = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
    })
    .catch(() => {
      console.warn("FCM not supported in this browser");
    });
}

export { app, messaging };
