import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBxZEZ3pry8tE3r5o1Jyl3kb6lupqI7a4k",
    authDomain: "sistema-de-suporte-ao-mestre.firebaseapp.com",
    projectId: "sistema-de-suporte-ao-mestre",
    storageBucket: "sistema-de-suporte-ao-mestre.firebasestorage.app",
    messagingSenderId: "371640165093",
    appId: "1:371640165093:web:5598d7bd37365882e8aa0c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 