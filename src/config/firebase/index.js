import firebase, { initializeApp } from 'firebase/app';
import 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDzy9eZLVDe-1bWGdH3sfIp9Tkrci1WRVQ",
    authDomain: "firestore-manajemen-rumahmakan.firebaseapp.com",
    projectId: "firestore-manajemen-rumahmakan",
    storageBucket: "firestore-manajemen-rumahmakan.appspot.com",
    messagingSenderId: "80461589179",
    appId: "1:80461589179:web:bc5f45e7fd55f2a5d8979e",
    measurementId: "G-D97FWMG1R8"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
//   const analytics = getAnalytics(app);
export const db = getFirestore(app);

export default app;