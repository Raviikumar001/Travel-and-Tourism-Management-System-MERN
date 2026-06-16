// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
//temporary souls firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "mern-travel-tourism.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID || "mern-travel-tourism",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "mern-travel-tourism.appspot.com",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || "304378877141",
  appId:
    import.meta.env.VITE_APP_ID || "1:304378877141:web:3bddab2778ca23186f7e5c",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
