import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2_zv7yH3kjFISMdnvd_5bwwNqlHhI5aY",
  authDomain: "studio-8492559500-cec2c.firebaseapp.com",
  projectId: "studio-8492559500-cec2c",
  storageBucket: "studio-8492559500-cec2c.firebasestorage.app",
  messagingSenderId: "1040172361240",
  appId: "1:1040172361240:web:632f49d2d99474186c856d"
};

// Initialize Firebase
let app;
let auth: any;
let db: any;
let googleProvider: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

export { auth, db, googleProvider };