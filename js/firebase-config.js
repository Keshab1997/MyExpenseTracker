// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// AUTH IMPORTS ADDED HERE 👇
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    // তোমার কনফিগ ডাটা (আগেরটাই থাকবে)
    apiKey: "AIzaSyC1fhe_5sAgwito2c6buK7GOgpW4veEmVI",
    authDomain: "myexpensetracker-99946.firebaseapp.com",
    projectId: "myexpensetracker-99946",
    storageBucket: "myexpensetracker-99946.firebasestorage.app",
    messagingSenderId: "731646861246",
    appId: "1:731646861246:web:94c73ce183cdcdfe02a3ef",
    measurementId: "G-CG0LPWJKBH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

console.log("🔥 Firebase Auth Ready!");

// সবকিছু এক্সপোর্ট করছি যাতে অন্য ফাইলে ব্যবহার করা যায়
export { 
    db, 
    auth, 
    provider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
};