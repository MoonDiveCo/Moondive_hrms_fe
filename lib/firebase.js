// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBbvMsu_VLrJgE-0q-ObAZTEPo5k7P0tUE",
  authDomain: "hrms-b8952.firebaseapp.com",
  projectId: "hrms-b8952",
  storageBucket: "hrms-b8952.firebasestorage.app",
  messagingSenderId: "872199865986",
  appId: "1:872199865986:web:ea38e87c2466099e42169b",
  measurementId: "G-2EV5D9EK0Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);