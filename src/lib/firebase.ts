// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";

// TODO: Add your Firebase project configuration
const firebaseConfig = {
  // Your config will be populated here automatically
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
