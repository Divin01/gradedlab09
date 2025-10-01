// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxmunsAHwfR8dYNoRFY-xNtLkE0_jvMZA",
  authDomain: "taskmanagerapp-abb8f.firebaseapp.com",
  projectId: "taskmanagerapp-abb8f",
  storageBucket: "taskmanagerapp-abb8f.firebasestorage.app",
  messagingSenderId: "584817125861",
  appId: "1:584817125861:web:d2832524e368fc2cd3270c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);